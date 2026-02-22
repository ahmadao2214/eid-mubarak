import React, { useEffect } from "react";
import { Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from "react-native-reanimated";

type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

const COLORS: Record<ToastType, string> = {
  success: "#00C853",
  error: "#FF5252",
  info: "#2196F3",
};

export function Toast({ message, type, visible, onHide, duration = 3000 }: ToastProps) {
  const translateY = useSharedValue(100);

  useEffect(() => {
    if (visible) {
      translateY.value = withTiming(0, { duration: 300 });
      const timer = setTimeout(() => {
        translateY.value = withTiming(100, { duration: 300 }, () => {
          runOnJS(onHide)();
        });
      }, duration);
      return () => clearTimeout(timer);
    } else {
      translateY.value = 100;
    }
  }, [visible, duration, onHide]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  if (!visible) return null;

  return (
    <Animated.View
      testID="toast"
      style={[
        {
          position: "absolute",
          bottom: 40,
          left: 20,
          right: 20,
          backgroundColor: COLORS[type],
          borderRadius: 12,
          padding: 16,
          alignItems: "center",
        },
        animatedStyle,
      ]}
    >
      <Text testID="toast-message" style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>
        {message}
      </Text>
    </Animated.View>
  );
}
