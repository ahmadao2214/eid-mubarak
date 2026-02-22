import type { TextStyle } from "react-native";
import type { FontStyle } from "@/types";

export const RN_FONT_MAP: Record<FontStyle, Partial<Pick<TextStyle, "fontFamily" | "fontStyle">>> = {
  psychedelic: { fontFamily: "monospace" },
  classic: { fontFamily: "serif" },
  bollywood: { fontFamily: "serif", fontStyle: "italic" },
  clean: {},
  "trucker-art": { fontFamily: "monospace" },
};
