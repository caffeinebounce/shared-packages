import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DraggableCardBody, DraggableCardContainer } from "./draggable-card";

describe("DraggableCard", () => {
  it("renders children inside the animated card body", () => {
    const { container } = render(
      <DraggableCardContainer>
        <DraggableCardBody className="custom-card">
          <p>Drag me</p>
        </DraggableCardBody>
      </DraggableCardContainer>,
    );

    expect(screen.getByText("Drag me")).toBeInTheDocument();
    expect(container.querySelector(".custom-card")).toHaveClass("bg-card");
  });

  it("merges caller classes onto the perspective container", () => {
    const { container } = render(
      <DraggableCardContainer className="custom-container">
        <DraggableCardBody>Card</DraggableCardBody>
      </DraggableCardContainer>,
    );

    expect(container.querySelector(".custom-container")).toHaveClass(
      "[perspective:3000px]",
    );
  });
});
