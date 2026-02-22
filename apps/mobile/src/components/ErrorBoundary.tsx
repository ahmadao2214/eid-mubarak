import React from "react";
import { View, Text, Pressable } from "react-native";

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  handleRetry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
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
            Something went wrong
          </Text>
          <Text style={{ color: "#999", fontSize: 14, marginBottom: 24, textAlign: "center" }}>
            An unexpected error occurred. Please try again.
          </Text>
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
