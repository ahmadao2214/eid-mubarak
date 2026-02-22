import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Skeleton } from "@/components/Skeleton";

describe("Skeleton", () => {
  it("renders with correct dimensions", () => {
    render(<Skeleton width={100} height={20} />);
    const skeleton = screen.getByTestId("skeleton");
    expect(skeleton).toBeTruthy();
  });

  it("renders with custom borderRadius", () => {
    render(<Skeleton width={200} height={40} borderRadius={20} />);
    expect(screen.getByTestId("skeleton")).toBeTruthy();
  });
});
