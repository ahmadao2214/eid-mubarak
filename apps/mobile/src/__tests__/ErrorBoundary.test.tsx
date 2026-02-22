import React from "react";
import { Text } from "react-native";
import { render, screen, fireEvent } from "@testing-library/react-native";
import { ErrorBoundary } from "@/components/ErrorBoundary";

function GoodChild() {
  return <Text>All good</Text>;
}

function BadChild(): React.ReactElement {
  throw new Error("test error");
}

// Suppress console.error for expected errors
const originalError = console.error;
beforeAll(() => {
  console.error = jest.fn();
});
afterAll(() => {
  console.error = originalError;
});

describe("ErrorBoundary", () => {
  it("renders children normally", () => {
    render(
      <ErrorBoundary>
        <GoodChild />
      </ErrorBoundary>,
    );
    expect(screen.getByText("All good")).toBeTruthy();
  });

  it("catches thrown errors and shows fallback", () => {
    render(
      <ErrorBoundary>
        <BadChild />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId("error-boundary")).toBeTruthy();
    expect(screen.getByText("Something went wrong")).toBeTruthy();
  });

  it("shows retry button", () => {
    render(
      <ErrorBoundary>
        <BadChild />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId("error-retry-button")).toBeTruthy();
    expect(screen.getByText("Try again")).toBeTruthy();
  });

  it("retry resets error state", () => {
    let shouldThrow = true;
    function ConditionalChild() {
      if (shouldThrow) throw new Error("boom");
      return <Text>Recovered</Text>;
    }

    render(
      <ErrorBoundary>
        <ConditionalChild />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId("error-boundary")).toBeTruthy();

    shouldThrow = false;
    fireEvent.press(screen.getByTestId("error-retry-button"));
    expect(screen.getByText("Recovered")).toBeTruthy();
  });
});
