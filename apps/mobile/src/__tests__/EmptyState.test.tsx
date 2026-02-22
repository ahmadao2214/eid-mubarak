import React from "react";
import { render, screen } from "@testing-library/react-native";
import { EmptyState } from "@/components/EmptyState";

describe("EmptyState", () => {
  it("renders title and subtitle", () => {
    render(<EmptyState title="Nothing here" subtitle="Try creating something" />);
    expect(screen.getByTestId("empty-state")).toBeTruthy();
    expect(screen.getByText("Nothing here")).toBeTruthy();
    expect(screen.getByText("Try creating something")).toBeTruthy();
  });
});
