import React from "react";
import { OverlayProvider } from "@gluestack-ui/overlay";

/**
 * GluestackUIProvider — NativeWind mode.
 *
 * Wraps the app with the OverlayProvider required by Modal and other
 * overlay-based components.  No styled-engine provider is needed because
 * all styling flows through NativeWind / Tailwind CSS.
 */
export function GluestackUIProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <OverlayProvider>{children}</OverlayProvider>;
}
