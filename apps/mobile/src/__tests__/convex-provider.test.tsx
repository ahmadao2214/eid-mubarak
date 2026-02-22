import React from "react";
import { Text } from "react-native";
import { render, screen } from "@testing-library/react-native";

// Mock the convex module to avoid ESM issues
jest.mock("@/lib/convex", () => ({
  CONVEX_URL: "https://test.convex.cloud",
  convexClient: {
    query: jest.fn(),
    mutation: jest.fn(),
    action: jest.fn(),
  },
  ConvexProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  ConvexReactClient: jest.fn().mockImplementation(() => ({})),
}));

describe("ConvexProvider", () => {
  it("renders children through the provider", () => {
    const { ConvexProvider } = require("@/lib/convex");
    render(
      <ConvexProvider client={{}}>
        <Text>Hello Convex</Text>
      </ConvexProvider>,
    );
    expect(screen.getByText("Hello Convex")).toBeTruthy();
  });

  it("exports convexClient singleton", () => {
    const { convexClient } = require("@/lib/convex");
    expect(convexClient).toBeDefined();
    expect(convexClient.query).toBeDefined();
    expect(convexClient.mutation).toBeDefined();
    expect(convexClient.action).toBeDefined();
  });
});
