import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ConvexProvider } from "convex/react";
import App from "./App";
import Gallery from "./Gallery";
import { convex } from "./convexClient";

const params = new URLSearchParams(window.location.search);
const mode = params.get("mode");

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {mode === "gallery" ? (
      <ConvexProvider client={convex}>
        <Gallery />
      </ConvexProvider>
    ) : (
      <App />
    )}
  </StrictMode>,
);
