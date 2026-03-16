import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AiAssistantProvider, useAiAssistant, useAiCapability } from "./index";

const testCapability = {
  id: "assist",
  name: "Assist",
  description: "Helpful test capability",
  icon: "sparkles",
  placeholder: "Ask for help",
  onSubmit: vi.fn(async (input: string) => ({
    success: true,
    message: `Handled: ${input}`,
  })),
};

function CapabilityHarness() {
  useAiCapability(testCapability, { autoActivate: true });
  const { activeCapability, capabilities, isOpen, open } = useAiAssistant();

  return (
    <div>
      <button type="button" onClick={open}>
        Open
      </button>
      <span data-testid="active-capability">
        {activeCapability?.id ?? "none"}
      </span>
      <span data-testid="capability-count">{capabilities.length}</span>
      <span data-testid="is-open">{String(isOpen)}</span>
    </div>
  );
}

describe("@caffeinebounce/ai-assistant", () => {
  it("registers capabilities and exposes provider state through the public API", async () => {
    render(
      <AiAssistantProvider>
        <CapabilityHarness />
      </AiAssistantProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("capability-count")).toHaveTextContent("1");
    });

    expect(screen.getByTestId("active-capability")).toHaveTextContent("assist");
    expect(screen.getByTestId("is-open")).toHaveTextContent("false");

    screen.getByRole("button", { name: "Open" }).click();

    await waitFor(() => {
      expect(screen.getByTestId("is-open")).toHaveTextContent("true");
    });
  });
});
