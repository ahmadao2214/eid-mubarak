import React from "react";
import { render, screen, fireEvent } from "@testing-library/react-native";
import HomeScreen from "../../app/index";

const mockPush = jest.fn();
const mockRouter = { push: mockPush, back: jest.fn() };

jest.mock("expo-router", () => ({
  useRouter: () => mockRouter,
  useFocusEffect: (cb: () => void) => {
    const React = require("react");
    React.useEffect(() => {
      cb();
    }, []);
  },
}));

jest.mock("react-native-safe-area-context", () => ({
  SafeAreaView: ({ children, ...props }: any) => {
    const { View } = require("react-native");
    return <View {...props}>{children}</View>;
  },
}));

jest.mock("react-native-reanimated", () =>
  require("react-native-reanimated/mock"),
);

jest.mock("@/repositories/projects", () => ({
  listAllProjects: jest.fn().mockResolvedValue([]),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe("HomeScreen", () => {
  it("renders Send Eid Vibes title", () => {
    render(<HomeScreen />);
    expect(screen.getByText("Send Eid Vibes")).toBeTruthy();
  });

  it("renders subtitle", () => {
    render(<HomeScreen />);
    expect(
      screen.getByText(
        "Create cheesy Eid video cards with maximum aunty energy",
      ),
    ).toBeTruthy();
  });

  it("renders Send Vibes CTA button", () => {
    render(<HomeScreen />);
    expect(screen.getByTestId("create-new-card")).toBeTruthy();
    expect(screen.getByText("Send Vibes")).toBeTruthy();
  });

  it("Send Vibes navigates to /create/editor", () => {
    render(<HomeScreen />);
    fireEvent.press(screen.getByTestId("create-new-card"));
    expect(mockPush).toHaveBeenCalledWith("/create/editor");
  });

  it("renders My Vibes link", () => {
    render(<HomeScreen />);
    expect(screen.getByTestId("my-vibes-link")).toBeTruthy();
    expect(screen.getByText("My Vibes")).toBeTruthy();
  });

  it("My Vibes link navigates to /saved", () => {
    render(<HomeScreen />);
    fireEvent.press(screen.getByTestId("my-vibes-link"));
    expect(mockPush).toHaveBeenCalledWith("/saved");
  });

  it("renders Featured Templates section", () => {
    render(<HomeScreen />);
    expect(screen.getByText("Featured Templates")).toBeTruthy();
  });

  it("renders preset template cards", () => {
    render(<HomeScreen />);
    expect(screen.getByTestId("featured-template-zohran-classic")).toBeTruthy();
  });
});
