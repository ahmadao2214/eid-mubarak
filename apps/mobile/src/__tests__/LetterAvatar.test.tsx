import React from "react";
import { render, screen } from "@testing-library/react-native";
import { LetterAvatar } from "@/components/LetterAvatar";

describe("LetterAvatar", () => {
  it("renders single initial for single-word name", () => {
    render(<LetterAvatar name="Drake" size={64} />);
    expect(screen.getByText("D")).toBeTruthy();
  });

  it("renders two initials for multi-word name", () => {
    render(<LetterAvatar name="Shah Rukh Khan" size={64} />);
    expect(screen.getByText("SK")).toBeTruthy();
  });

  it("produces deterministic color for same name", () => {
    const { unmount } = render(<LetterAvatar name="Drake" size={64} testID="avatar-1" />);
    const avatar1Style = screen.getByTestId("avatar-1").props.style;
    unmount();

    render(<LetterAvatar name="Drake" size={64} testID="avatar-2" />);
    const avatar2Style = screen.getByTestId("avatar-2").props.style;

    // Both should have the same background color
    const getBg = (style: any) => {
      if (Array.isArray(style)) {
        for (const s of style) {
          if (s?.backgroundColor) return s.backgroundColor;
        }
      }
      return style?.backgroundColor;
    };
    expect(getBg(avatar1Style)).toBe(getBg(avatar2Style));
  });

  it("shows gold border when selected", () => {
    render(<LetterAvatar name="Drake" size={64} selected testID="avatar-selected" />);
    const avatar = screen.getByTestId("avatar-selected");
    const style = Array.isArray(avatar.props.style)
      ? Object.assign({}, ...avatar.props.style)
      : avatar.props.style;
    expect(style.borderColor).toBe("#FFD700");
  });

  it("renders without crash for single character name", () => {
    render(<LetterAvatar name="A" size={64} />);
    expect(screen.getByText("A")).toBeTruthy();
  });

  it("renders without crash for empty string", () => {
    render(<LetterAvatar name="" size={64} testID="empty-avatar" />);
    expect(screen.getByTestId("empty-avatar")).toBeTruthy();
  });
});
