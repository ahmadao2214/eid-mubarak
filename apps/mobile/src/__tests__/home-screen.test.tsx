import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
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

// Mock Gluestack UI components
jest.mock("@/components/ui/modal", () => {
  const { View, Text, Pressable } = require("react-native");
  return {
    Modal: ({ isOpen, children }: any) => (isOpen ? <View>{children}</View> : null),
    ModalBackdrop: () => null,
    ModalContent: ({ children, ...props }: any) => <View {...props}>{children}</View>,
    ModalHeader: ({ children }: any) => <View>{children}</View>,
    ModalBody: ({ children }: any) => <View>{children}</View>,
    ModalFooter: ({ children }: any) => <View>{children}</View>,
  };
});

jest.mock("@/components/ui/button", () => {
  const { Pressable, Text } = require("react-native");
  return {
    Button: ({ children, onPress, testID, ...props }: any) => (
      <Pressable testID={testID} onPress={onPress} {...props}>{children}</Pressable>
    ),
    ButtonText: ({ children, ...props }: any) => <Text {...props}>{children}</Text>,
  };
});

const mockListAllProjects = jest.fn();
const mockRemoveProject = jest.fn();

jest.mock("@/repositories/projects", () => ({
  get listAllProjects() {
    return mockListAllProjects;
  },
  get removeProject() {
    return mockRemoveProject;
  },
}));

const mockComposition = {
  width: 1080,
  height: 1920,
  fps: 30,
  durationInFrames: 300,
  background: { type: "solid" as const, source: "#1a1a2e" },
  hue: { enabled: false, color: "none" as const, opacity: 0, animation: "static" as const },
  head: {
    imageUrl: "",
    position: { x: 50, y: 45 },
    scale: 0.4,
    enterAtFrame: 15,
    animation: "pop" as const,
  },
  decorativeElements: [],
  textSlots: [
    {
      id: "main",
      text: "Eid Mubarak!",
      position: { x: 50, y: 75 },
      fontFamily: "clean" as const,
      fontSize: 64,
      color: "#FFFFFF",
      animation: "fade-in" as const,
      enterAtFrame: 45,
    },
  ],
  audio: { trackUrl: "", volume: 0.8 },
};

beforeEach(() => {
  jest.clearAllMocks();
  mockListAllProjects.mockResolvedValue([]);
});

describe("HomeScreen", () => {
  it("renders Create New Card button", async () => {
    render(<HomeScreen />);
    await waitFor(() => {
      expect(screen.getByTestId("create-new-card")).toBeTruthy();
    });
    expect(screen.getByText("Create New Card")).toBeTruthy();
  });

  it("button navigates to /create/step1", async () => {
    render(<HomeScreen />);
    await waitFor(() => {
      expect(screen.getByTestId("create-new-card")).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId("create-new-card"));
    expect(mockPush).toHaveBeenCalledWith("/create/step1");
  });

  it("shows empty state when no saved projects", async () => {
    mockListAllProjects.mockResolvedValue([]);
    render(<HomeScreen />);
    await waitFor(() => {
      expect(screen.getByTestId("empty-state")).toBeTruthy();
    });
    expect(screen.getByText("No saved projects")).toBeTruthy();
  });

  it("shows project cards when projects exist", async () => {
    mockListAllProjects.mockResolvedValue([
      {
        id: "proj-1",
        name: "Test Card",
        composition: mockComposition,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);
    render(<HomeScreen />);
    await waitFor(() => {
      expect(screen.getByTestId("project-card-proj-1")).toBeTruthy();
    });
    expect(screen.getByText("Test Card")).toBeTruthy();
  });

  it("tapping project card navigates with projectId param", async () => {
    mockListAllProjects.mockResolvedValue([
      {
        id: "proj-1",
        name: "Test Card",
        composition: mockComposition,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);
    render(<HomeScreen />);
    await waitFor(() => {
      expect(screen.getByTestId("project-card-proj-1")).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId("project-card-proj-1"));
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/create/step1",
      params: { projectId: "proj-1" },
    });
  });

  it("delete icon opens confirmation modal", async () => {
    mockListAllProjects.mockResolvedValue([
      {
        id: "proj-1",
        name: "Test Card",
        composition: mockComposition,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);
    render(<HomeScreen />);
    await waitFor(() => {
      expect(screen.getByTestId("delete-project-proj-1")).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId("delete-project-proj-1"));
    await waitFor(() => {
      expect(screen.getByText(/Are you sure/)).toBeTruthy();
    });
  });

  it("confirming delete removes project from list", async () => {
    mockListAllProjects.mockResolvedValue([
      {
        id: "proj-1",
        name: "Test Card",
        composition: mockComposition,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);
    mockRemoveProject.mockResolvedValue(undefined);
    render(<HomeScreen />);
    await waitFor(() => {
      expect(screen.getByTestId("delete-project-proj-1")).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId("delete-project-proj-1"));
    await waitFor(() => {
      expect(screen.getByTestId("confirm-delete")).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId("confirm-delete"));
    await waitFor(() => {
      expect(mockRemoveProject).toHaveBeenCalledWith("proj-1");
      expect(screen.queryByTestId("project-card-proj-1")).toBeNull();
    });
  });

  it("canceling delete closes modal without changes", async () => {
    mockListAllProjects.mockResolvedValue([
      {
        id: "proj-1",
        name: "Test Card",
        composition: mockComposition,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      },
    ]);
    render(<HomeScreen />);
    await waitFor(() => {
      expect(screen.getByTestId("delete-project-proj-1")).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId("delete-project-proj-1"));
    await waitFor(() => {
      expect(screen.getByTestId("cancel-delete")).toBeTruthy();
    });
    fireEvent.press(screen.getByTestId("cancel-delete"));
    await waitFor(() => {
      expect(screen.getByTestId("project-card-proj-1")).toBeTruthy();
    });
    expect(mockRemoveProject).not.toHaveBeenCalled();
  });
});
