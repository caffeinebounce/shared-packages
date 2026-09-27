// Runs from an isolated install created by isolated-install.mjs.
// Proves @caffeinebounce/logger/node loads and forwards logs without next or react.
import assert from "node:assert/strict";
import { createServer } from "node:http";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
for (const absent of ["next", "react"]) {
  assert.throws(
    () => require.resolve(absent),
    { code: "MODULE_NOT_FOUND" },
    `${absent} must not be installed for this probe`,
  );
}

const received = [];
const intake = createServer((request, response) => {
  let body = "";
  request.on("data", (chunk) => {
    body += chunk;
  });
  request.on("end", () => {
    received.push({
      authorization: request.headers.authorization,
      events: JSON.parse(body),
    });
    response.end("{}");
  });
});
await new Promise((resolveListen) =>
  intake.listen(0, "127.0.0.1", resolveListen),
);

try {
  process.env.BETTER_STACK_SOURCE_TOKEN = "consumer-smoke-placeholder";
  process.env.BETTER_STACK_INGESTING_URL = `http://127.0.0.1:${intake.address().port}`;

  const entry = await import("@caffeinebounce/logger/node");
  for (const name of [
    "adminLogger",
    "authLogger",
    "getOrGenerateCorrelationId",
    "getServerLogger",
    "logger",
    "sanitizeErrorMessageForClient",
  ]) {
    assert.ok(name in entry, `missing export "${name}"`);
  }

  entry.logger.info("consumer smoke", { event: "consumer.smoke" });
  await entry.logger.flush();

  assert.equal(received.length, 1, "expected one intake request");
  assert.equal(
    received[0].authorization,
    "Bearer consumer-smoke-placeholder",
  );
  assert.equal(received[0].events[0]?.message, "consumer smoke");
} finally {
  intake.close();
}
