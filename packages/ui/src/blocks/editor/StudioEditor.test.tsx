import { render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { StudioEditor } from "./StudioEditor";

type StudioEditorSDKProps = {
  options: {
    project: {
      default: unknown;
    };
    storage: unknown;
  };
};

let lastStudioEditorSDKProps: StudioEditorSDKProps | null = null;

vi.mock("@grapesjs/studio-sdk/style", () => ({}));

vi.mock("@grapesjs/studio-sdk/react", () => ({
  default: (props: StudioEditorSDKProps) => {
    lastStudioEditorSDKProps = props;
    return <div data-testid="studio-editor-sdk" />;
  },
}));

describe("StudioEditor", () => {
  beforeEach(() => {
    lastStudioEditorSDKProps = null;
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("uses provided initialProject as project.default", () => {
    const initialProject = {
      pages: [{ name: "Custom", component: "<div>Custom</div>" }],
    };

    render(<StudioEditor initialProject={initialProject} />);

    expect(screen.getByTestId("studio-editor-sdk")).toBeInTheDocument();
    expect(lastStudioEditorSDKProps?.options.project.default).toBe(
      initialProject,
    );
  });

  it("builds default web project content when initialProject is not provided", () => {
    render(<StudioEditor projectType="web" />);

    const project = lastStudioEditorSDKProps?.options.project.default as
      | { pages?: Array<{ name?: string; component?: string }> }
      | undefined;

    expect(project?.pages?.[0]?.name).toBe("Form");
    expect(project?.pages?.[0]?.component).toContain(
      "Drop form elements here to build your form",
    );
  });

  it("passes false storage config when storage.type is false", () => {
    render(<StudioEditor storage={{ type: false }} />);
    expect(lastStudioEditorSDKProps?.options.storage).toBe(false);
  });

  it("clears GrapesJS localStorage keys when storage is disabled", () => {
    window.localStorage.setItem("gjsProject", "project");
    window.localStorage.setItem("gjs-custom", "custom");
    window.localStorage.setItem("grapes-session", "session");
    window.localStorage.setItem("unrelated-key", "keep");

    render(<StudioEditor storage={{ type: false }} />);

    expect(window.localStorage.getItem("gjsProject")).toBeNull();
    expect(window.localStorage.getItem("gjs-custom")).toBeNull();
    expect(window.localStorage.getItem("grapes-session")).toBeNull();
    expect(window.localStorage.getItem("unrelated-key")).toBe("keep");
  });
});
