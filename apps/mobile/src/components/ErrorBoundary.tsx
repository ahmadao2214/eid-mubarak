import React from "react";
import { View, Text, Pressable } from "react-native";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

const isConvexNotDeployedMessage = (message: string): boolean =>
  message.includes("Could not find public function for");

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error for debugging; state is already set by getDerivedStateFromError
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      const msg = this.state.error?.message ?? "An unexpected error occurred.";
      const isConvexBackendMissing = isConvexNotDeployedMessage(msg);

      return (
        <View
          testID="error-boundary"
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#1a1a2e",
            padding: 20,
          }}
        >
          <Text style={{ color: "#FF5252", fontSize: 20, fontWeight: "bold", marginBottom: 8 }}>
            {isConvexBackendMissing ? "Backend not deployed" : "Something went wrong"}
          </Text>
          <Text style={{ color: "#999", fontSize: 14, marginBottom: 24, textAlign: "center" }}>
            {isConvexBackendMissing
              ? "Deploy your Convex functions so the app can load projects and data. In a terminal, run:"
              : "An unexpected error occurred. Please try again."}
          </Text>
          {isConvexBackendMissing && (
            <Text
              style={{
                color: "#FFD700",
                fontSize: 13,
                fontFamily: "monospace",
                marginBottom: 24,
                textAlign: "center",
              }}
              selectable
            >
              cd apps/mobile && npx convex dev
            </Text>
          )}
          {!isConvexBackendMissing && msg ? (
            <Text style={{ color: "#666", fontSize: 12, marginBottom: 24, textAlign: "center" }}>
              {msg}
            </Text>
          ) : null}
          <Pressable
            testID="error-retry-button"
            onPress={this.handleRetry}
            style={{
              backgroundColor: "#FFD700",
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#1a1a2e", fontWeight: "bold", fontSize: 16 }}>Try again</Text>
          </Pressable>
        </View>
      );
    }

    return this.props.children;
  }
}
