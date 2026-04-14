#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import time
import traceback
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

DEFAULT_BRANCHES = ["main"]
DEFAULT_PR_LANES = ["pr-fast"]
DEFAULT_BRANCH_LANES = ["branch-full"]
DEFAULT_MANUAL_LANES = ["heavy-full"]
LANE_DEFINITIONS = {
    "pr-fast": {
        "status_context": "local-ci/pr-fast",
        "command": ["bash", "ci/run_lane.sh", "--lane", "pr-fast"],
    },
    "branch-full": {
        "status_context": "local-ci/branch-full",
        "command": ["bash", "ci/run_lane.sh", "--lane", "branch-full"],
    },
    "heavy-full": {
        "status_context": "local-ci/heavy-full",
        "command": ["bash", "ci/run_lane.sh", "--lane", "heavy-full"],
    },
    "live-smoke": {
        "status_context": "local-ci/live-smoke",
        "command": ["bash", "ci/run_lane.sh", "--lane", "live-smoke"],
    },
}


@dataclass
class Candidate:
    key: str
    sha: str
    ref: str
    description: str
    event_type: str
    metadata: dict[str, Any]


@dataclass
class LaneJob:
    candidate: Candidate
    lane: str

    @property
    def key(self) -> str:
        return f"{self.candidate.key}:{self.lane}"

    @property
    def description(self) -> str:
        return f"{self.candidate.description} [{self.lane}]"

    @property
    def status_context(self) -> str:
        return LANE_DEFINITIONS[self.lane]["status_context"]

    @property
    def command(self) -> list[str]:
        return list(LANE_DEFINITIONS[self.lane]["command"])


@dataclass
class SkipDecision:
    should_skip: bool
    reason: str | None = None


class GitHubClient:
    def __init__(self, repo: str, token: str, api_base: str = "https://api.github.com") -> None:
        self.repo = repo
        self.token = token
        self.api_base = api_base.rstrip("/")

    def _request(self, method: str, path: str, payload: dict[str, Any] | None = None) -> Any:
        data = None
        if payload is not None:
            data = json.dumps(payload).encode("utf-8")
        req = urllib.request.Request(f"{self.api_base}{path}", data=data, method=method)
        req.add_header("Authorization", f"Bearer {self.token}")
        req.add_header("Accept", "application/vnd.github+json")
        req.add_header("X-GitHub-Api-Version", "2022-11-28")
        if data is not None:
            req.add_header("Content-Type", "application/json")
        with urllib.request.urlopen(req, timeout=30) as response:
            body = response.read().decode("utf-8")
            return json.loads(body) if body else None

    def list_open_pull_requests(self, per_page: int = 20) -> list[dict[str, Any]]:
        path = f"/repos/{self.repo}/pulls?state=open&sort=updated&direction=desc&per_page={per_page}"
        return self._request("GET", path)

    def get_branch(self, branch: str) -> dict[str, Any]:
        encoded = urllib.parse.quote(branch, safe="")
        return self._request("GET", f"/repos/{self.repo}/branches/{encoded}")

    def create_status(self, sha: str, payload: dict[str, Any]) -> None:
        self._request("POST", f"/repos/{self.repo}/statuses/{sha}", payload)


class LocalCIRunner:
    def __init__(self, args: argparse.Namespace) -> None:
        self.args = args
        self.repo_dir = Path(args.repo).resolve()
        self.state_dir = Path(args.state_dir).resolve()
        self.worktree_root = self.state_dir / "worktrees"
        self.run_root = self.state_dir / "runs"
        self.state_file = self.state_dir / "state.json"
        self.branches = parse_csv(args.branches)
        self.pr_lanes = self.validate_lanes(parse_csv(args.pr_lanes), "PR")
        self.branch_lanes = self.validate_lanes(parse_csv(args.branch_lanes), "branch")
        self.manual_lanes = self.validate_lanes(parse_csv(args.manual_lanes), "manual")
        self.allow_fork_prs = args.allow_fork_prs
        self.running_timeout = max(0, args.running_timeout)
        self.github = None if args.no_github else GitHubClient(args.github_repo, self._read_token(), args.github_api_base)
        self.state_dir.mkdir(parents=True, exist_ok=True)
        self.worktree_root.mkdir(parents=True, exist_ok=True)
        self.run_root.mkdir(parents=True, exist_ok=True)

    def _read_token(self) -> str:
        token = os.environ.get("LOCAL_CI_GITHUB_TOKEN", "").strip()
        if not token and not self.args.no_github:
            raise SystemExit("LOCAL_CI_GITHUB_TOKEN is required unless --no-github is set")
        return token

    def validate_lanes(self, lanes: list[str], kind: str) -> list[str]:
        unknown = [lane for lane in lanes if lane not in LANE_DEFINITIONS]
        if unknown:
            raise SystemExit(f"Unknown {kind} lane(s): {', '.join(unknown)}")
        return lanes

    def load_state(self) -> dict[str, Any]:
        if not self.state_file.exists():
            return {"runs": {}}
        return json.loads(self.state_file.read_text())

    def save_state(self, state: dict[str, Any]) -> None:
        tmp = self.state_file.with_suffix(".tmp")
        tmp.write_text(json.dumps(state, indent=2, sort_keys=True) + "\n")
        tmp.replace(self.state_file)

    def log(self, message: str) -> None:
        print(f"[{datetime.now().isoformat(timespec='seconds')}] {message}", flush=True)

    def discover_candidates(self) -> list[Candidate]:
        candidates: list[Candidate] = []
        assert self.github is not None
        for pr in self.github.list_open_pull_requests(per_page=self.args.pr_limit):
            head_repo = ((pr.get("head") or {}).get("repo") or {})
            base_repo = ((pr.get("base") or {}).get("repo") or {})
            head_repo_name = head_repo.get("full_name")
            base_repo_name = base_repo.get("full_name") or self.args.github_repo
            same_repo = bool(head_repo_name and base_repo_name and head_repo_name == base_repo_name)
            if head_repo_name is None:
                same_repo = True
            if not same_repo and not self.allow_fork_prs:
                self.log(
                    f"skipping PR #{pr['number']} from fork {head_repo_name or 'unknown'}; "
                    "set LOCAL_CI_ALLOW_FORK_PRS=1 or --allow-fork-prs to opt in"
                )
                continue
            sha = pr["head"]["sha"]
            number = pr["number"]
            candidates.append(
                Candidate(
                    key=f"pr-{number}",
                    sha=sha,
                    ref=f"pull/{number}/head",
                    description=f"PR #{number}: {pr['title']}",
                    event_type="pull_request",
                    metadata={
                        "type": "pull_request",
                        "number": number,
                        "url": pr["html_url"],
                        "head_repo": head_repo_name,
                        "base_repo": base_repo_name,
                        "same_repo": same_repo,
                    },
                )
            )
        for branch in self.branches or DEFAULT_BRANCHES:
            payload = self.github.get_branch(branch)
            sha = payload["commit"]["sha"]
            candidates.append(
                Candidate(
                    key=f"branch-{branch}",
                    sha=sha,
                    ref=f"refs/heads/{branch}",
                    description=f"branch {branch}",
                    event_type="branch",
                    metadata={"type": "branch", "branch": branch},
                )
            )
        return candidates

    def lanes_for_candidate(self, candidate: Candidate) -> list[str]:
        if candidate.event_type == "pull_request":
            return self.pr_lanes
        if candidate.event_type == "branch":
            return self.branch_lanes
        if self.args.lanes:
            return self.validate_lanes(parse_csv(self.args.lanes), "manual")
        if self.args.lane:
            return self.validate_lanes([self.args.lane], "manual")
        return self.manual_lanes

    def pick_job(self, state: dict[str, Any]) -> LaneJob | None:
        runs = state.get("runs", {})
        if self.args.ref and self.args.sha:
            candidate = Candidate(
                key=self.args.run_key or self.args.ref.replace("/", "-"),
                sha=self.resolve_manual_sha(self.args.sha, self.args.ref),
                ref=self.args.ref,
                description=self.args.description or self.args.ref,
                event_type="manual",
                metadata={"type": "manual"},
            )
            for lane in self.lanes_for_candidate(candidate):
                return LaneJob(candidate=candidate, lane=lane)
            return None
        if self.github is None:
            return None
        for candidate in self.discover_candidates():
            for lane in self.lanes_for_candidate(candidate):
                job = LaneJob(candidate=candidate, lane=lane)
                previous = runs.get(job.key)
                decision = self.should_skip_job(job, previous, candidate.sha)
                if decision.should_skip:
                    if decision.reason:
                        self.log(f"skipping {job.description}: {decision.reason}")
                    continue
                return job
        return None

    def should_skip_job(self, job: LaneJob, previous: dict[str, Any] | None, candidate_sha: str) -> SkipDecision:
        if not previous or previous.get("sha") != candidate_sha:
            return SkipDecision(False)

        status = previous.get("status")
        if status in {"success", "failure"}:
            return SkipDecision(True, f"already recorded as {status} for {candidate_sha[:12]}")
        if status != "running":
            return SkipDecision(False)

        if self.running_timeout <= 0:
            return SkipDecision(True, "already marked running")

        updated_at = previous.get("updated_at")
        if not updated_at:
            return SkipDecision(False, "running state missing updated_at; retrying")

        try:
            updated_dt = parse_utc_timestamp(updated_at)
        except ValueError:
            return SkipDecision(False, f"invalid updated_at {updated_at!r}; retrying")

        age_seconds = (datetime.now(timezone.utc) - updated_dt).total_seconds()
        if age_seconds < self.running_timeout:
            return SkipDecision(True, f"already running for {int(age_seconds)}s")

        return SkipDecision(False, f"stale running state ({int(age_seconds)}s old); retrying")

    def post_status(self, job: LaneJob, state: str, description: str) -> None:
        if self.github is None:
            return
        payload = {
            "state": state,
            "context": job.status_context,
            "description": description[:140],
        }
        self.github.create_status(job.candidate.sha, payload)

    def run(self) -> int:
        state = self.load_state()
        job = self.pick_job(state)
        if job is None:
            self.log("no work found")
            return 0
        return self.run_job(job, state)

    def run_loop(self) -> int:
        while True:
            rc = self.run()
            if self.args.once:
                return rc
            time.sleep(self.args.poll_interval)

    def run_job(self, job: LaneJob, state: dict[str, Any]) -> int:
        candidate = job.candidate
        run_id = f"{candidate.key}-{job.lane}-{candidate.sha[:12]}-{int(time.time())}"
        run_dir = self.run_root / run_id
        artifacts_dir = run_dir / "artifacts"
        log_path = run_dir / "runner.log"
        run_dir.mkdir(parents=True, exist_ok=True)
        artifacts_dir.mkdir(parents=True, exist_ok=True)
        self.log(f"starting {job.description} at {candidate.sha[:12]}")
        self.post_status(job, "pending", f"Running {job.description}")
        state.setdefault("runs", {})[job.key] = {
            "sha": candidate.sha,
            "status": "running",
            "run_id": run_id,
            "updated_at": utc_now(),
            "metadata": candidate.metadata,
            "lane": job.lane,
            "status_context": job.status_context,
        }
        self.save_state(state)

        worktree_dir = self.worktree_root / run_id
        try:
            if not self.args.dry_run:
                self.prepare_worktree(candidate, worktree_dir)
                rc = self.execute_lane(job, worktree_dir, artifacts_dir, log_path)
            else:
                log_path.write_text("dry-run: skipped execution\n")
                rc = 0
            result = self.read_result(artifacts_dir, rc, candidate, job.lane)
        except Exception as exc:
            rc = 1
            traceback_text = traceback.format_exc()
            result = {
                "lane": job.lane,
                "status": "failure",
                "failed_step": "runner",
                "summary": f"runner exception: {exc}",
            }
            log_path.parent.mkdir(parents=True, exist_ok=True)
            log_path.write_text(traceback_text)
            self.log(traceback_text.rstrip())
        finally:
            self.cleanup_worktree(worktree_dir)

        final_status = "success" if rc == 0 and result.get("status") == "success" else "failure"
        description = self.describe_result(job, result)
        state["runs"][job.key] = {
            "sha": candidate.sha,
            "status": final_status,
            "run_id": run_id,
            "updated_at": utc_now(),
            "metadata": candidate.metadata,
            "lane": job.lane,
            "status_context": job.status_context,
            "artifacts_dir": str(artifacts_dir),
            "log_path": str(log_path),
            "result": result,
        }
        self.save_state(state)
        self.post_status(job, final_status, description)
        self.log(f"finished {job.description}: {final_status}")
        return 0 if final_status == "success" else 1

    def resolve_manual_sha(self, sha: str, ref: str) -> str:
        try:
            return run_cmd(["git", "-C", str(self.repo_dir), "rev-parse", f"{sha}^{{commit}}"], capture_output=True).strip()
        except subprocess.CalledProcessError:
            run_cmd(["git", "-C", str(self.repo_dir), "fetch", "--no-tags", "origin", ref])
            return run_cmd(["git", "-C", str(self.repo_dir), "rev-parse", "FETCH_HEAD^{commit}"], capture_output=True).strip()

    def prepare_worktree(self, candidate: Candidate, worktree_dir: Path) -> None:
        sha = candidate.sha
        if not self.commit_exists_locally(sha):
            run_cmd(["git", "-C", str(self.repo_dir), "fetch", "--no-tags", "origin", candidate.ref])
            sha = run_cmd(["git", "-C", str(self.repo_dir), "rev-parse", "FETCH_HEAD"], capture_output=True).strip()
        run_cmd(["git", "-C", str(self.repo_dir), "worktree", "add", "--detach", str(worktree_dir), sha])
        self.link_shared_path("node_modules", worktree_dir)
        self.link_shared_path(".yarn", worktree_dir)

    def commit_exists_locally(self, sha: str) -> bool:
        result = subprocess.run(
            ["git", "-C", str(self.repo_dir), "cat-file", "-e", f"{sha}^{{commit}}"],
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        return result.returncode == 0

    def link_shared_path(self, relative_path: str, worktree_dir: Path) -> None:
        source = self.repo_dir / relative_path
        if not source.exists():
            return
        target = worktree_dir / relative_path
        target.parent.mkdir(parents=True, exist_ok=True)
        if target.exists() or target.is_symlink():
            if target.is_dir() and not target.is_symlink():
                shutil.rmtree(target)
            else:
                target.unlink()
        target.symlink_to(source)

    def execute_lane(self, job: LaneJob, worktree_dir: Path, artifacts_dir: Path, log_path: Path) -> int:
        env = os.environ.copy()
        env.setdefault("CI", "1")
        env["LOCAL_CI_RUN_ID"] = job.key
        env["LOCAL_CI_REF"] = job.candidate.ref
        env["LOCAL_CI_LANE"] = job.lane
        with log_path.open("w") as log_file:
            proc = subprocess.run(
                [*job.command, "--artifacts-dir", str(artifacts_dir)],
                cwd=worktree_dir,
                env=env,
                stdout=log_file,
                stderr=subprocess.STDOUT,
                check=False,
                text=True,
            )
        return proc.returncode

    def read_result(self, artifacts_dir: Path, rc: int, candidate: Candidate, lane: str) -> dict[str, Any]:
        result_path = artifacts_dir / "result.json"
        if result_path.exists():
            return json.loads(result_path.read_text())
        return {
            "lane": lane,
            "status": "success" if rc == 0 else "failure",
            "failed_step": "unknown" if rc != 0 else "",
            "summary": f"{candidate.description} [{lane}] exited with {rc}",
        }

    def describe_result(self, job: LaneJob, result: dict[str, Any]) -> str:
        if result.get("status") == "success":
            return f"Passed {job.lane} for {job.candidate.description}"
        failed_step = result.get("failed_step") or "unknown step"
        return f"Failed {job.lane} at {failed_step} for {job.candidate.description}"

    def cleanup_worktree(self, worktree_dir: Path) -> None:
        if not worktree_dir.exists():
            return
        try:
            run_cmd(["git", "-C", str(self.repo_dir), "worktree", "remove", "--force", str(worktree_dir)])
        except subprocess.CalledProcessError:
            shutil.rmtree(worktree_dir, ignore_errors=True)


def run_cmd(cmd: list[str], capture_output: bool = False) -> str:
    kwargs: dict[str, Any] = {"check": True, "text": True}
    if capture_output:
        kwargs["stdout"] = subprocess.PIPE
        kwargs["stderr"] = subprocess.STDOUT
    result = subprocess.run(cmd, **kwargs)
    return result.stdout if capture_output else ""


def utc_now() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def parse_utc_timestamp(value: str) -> datetime:
    normalized = value.replace("Z", "+00:00")
    dt = datetime.fromisoformat(normalized)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone.utc)


def parse_csv(value: str | None) -> list[str]:
    if not value:
        return []
    return [part.strip() for part in value.split(",") if part.strip()]


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Poll GitHub and run local CI for shared-packages")
    parser.add_argument("--repo", default=".")
    parser.add_argument("--state-dir", default=".local-ci")
    parser.add_argument("--github-repo", default=os.environ.get("LOCAL_CI_GITHUB_REPO", "caffeinebounce/shared-packages"))
    parser.add_argument("--github-api-base", default=os.environ.get("LOCAL_CI_GITHUB_API_BASE", "https://api.github.com"))
    parser.add_argument("--branches", default=os.environ.get("LOCAL_CI_BRANCHES", ",".join(DEFAULT_BRANCHES)))
    parser.add_argument("--pr-lanes", default=os.environ.get("LOCAL_CI_PR_LANES", ",".join(DEFAULT_PR_LANES)))
    parser.add_argument("--branch-lanes", default=os.environ.get("LOCAL_CI_BRANCH_LANES", ",".join(DEFAULT_BRANCH_LANES)))
    parser.add_argument("--manual-lanes", default=os.environ.get("LOCAL_CI_MANUAL_LANES", ",".join(DEFAULT_MANUAL_LANES)))
    parser.add_argument("--poll-interval", type=int, default=int(os.environ.get("LOCAL_CI_POLL_INTERVAL", "120")))
    parser.add_argument("--pr-limit", type=int, default=int(os.environ.get("LOCAL_CI_PR_LIMIT", "20")))
    parser.add_argument("--once", action="store_true")
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--no-github", action="store_true")
    parser.add_argument("--ref")
    parser.add_argument("--sha")
    parser.add_argument("--run-key")
    parser.add_argument("--description")
    parser.add_argument("--lane")
    parser.add_argument("--lanes")
    parser.add_argument("--list-lanes", action="store_true")
    parser.add_argument(
        "--allow-fork-prs",
        action="store_true",
        default=os.environ.get("LOCAL_CI_ALLOW_FORK_PRS", "").strip().lower() in {"1", "true", "yes", "on"},
    )
    parser.add_argument(
        "--running-timeout",
        type=int,
        default=int(os.environ.get("LOCAL_CI_RUNNING_TIMEOUT", str(6 * 60 * 60))),
        help="Seconds before a running state is considered stale and retried",
    )
    return parser


def main() -> int:
    args = build_parser().parse_args()
    if args.list_lanes:
        for lane, meta in LANE_DEFINITIONS.items():
            print(f"{lane}\t{meta['status_context']}\t{' '.join(meta['command'])}")
        return 0
    runner = LocalCIRunner(args)
    return runner.run_loop()


if __name__ == "__main__":
    sys.exit(main())
