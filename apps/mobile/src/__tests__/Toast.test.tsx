import React from "react";
import { render, screen } from "@testing-library/react-native";
import { Toast } from "@/components/Toast";

describe("Toast", () => {
  it("renders message when visible", () => {
    render(
      <Toast message="Success!" type="success" visible={true} onHide={jest.fn()} />,
    );
    expect(screen.getByTestId("toast")).toBeTruthy();
    expect(screen.getByTestId("toast-message")).toBeTruthy();
    expect(screen.getByText("Success!")).toBeTruthy();
  });

  it("does not render when not visible", () => {
    render(
      <Toast message="Hidden" type="info" visible={false} onHide={jest.fn()} />,
    );
    expect(screen.queryByTestId("toast")).toBeNull();
  });

  it("renders with success type", () => {
    render(
      <Toast message="Done" type="success" visible={true} onHide={jest.fn()} />,
    );
    expect(screen.getByTestId("toast")).toBeTruthy();
  });

  it("renders with error type", () => {
    render(
      <Toast message="Failed" type="error" visible={true} onHide={jest.fn()} />,
    );
    expect(screen.getByTestId("toast")).toBeTruthy();
  });

  it("renders with info type", () => {
    render(
      <Toast message="Info" type="info" visible={true} onHide={jest.fn()} />,
    );
    expect(screen.getByTestId("toast")).toBeTruthy();
  });
});
