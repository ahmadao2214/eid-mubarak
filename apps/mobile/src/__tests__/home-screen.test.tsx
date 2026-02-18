import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import HomeScreen from "../../app/index";

const mockPush = jest.fn();
const mockRouter = { push: mockPush, back: jest.fn() };

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children, ...props }: any) => {
    const { View } = require("react-native");
    return <View {...props}>{children}</View>;
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("HomeScreen", () => {
  it("renders header title", () => {
    render(<HomeScreen />);
    expect(screen.getByText("Eid Mubarak!")).toBeTruthy();
  });

  it("renders subtitle", () => {
    render(<HomeScreen />);
    expect(
      screen.getByText(
        "Create cheesy Eid video cards with maximum aunty energy",
      ),
    ).toBeTruthy();
  });

  it("renders Create New Card button", () => {
    render(<HomeScreen />);
    expect(screen.getByTestId("create-new-card")).toBeTruthy();
    expect(screen.getByText("Create New Card")).toBeTruthy();
  });

  it("Create New Card navigates to /create/step1", () => {
    render(<HomeScreen />);
    fireEvent.press(screen.getByTestId("create-new-card"));
    expect(mockPush).toHaveBeenCalledWith("/create/step1");
  });

  it("renders My Cards button", () => {
    render(<HomeScreen />);
    expect(screen.getByTestId("my-cards-button")).toBeTruthy();
    expect(screen.getByText("My Cards")).toBeTruthy();
  });

  it("My Cards button navigates to /saved", () => {
    render(<HomeScreen />);
    fireEvent.press(screen.getByTestId("my-cards-button"));
    expect(mockPush).toHaveBeenCalledWith("/saved");
  });

  it("does NOT show saved projects section", () => {
    render(<HomeScreen />);
    expect(screen.queryByText("Saved Projects")).toBeNull();
    expect(screen.queryByTestId("loading-indicator")).toBeNull();
  });
});
