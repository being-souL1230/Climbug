import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { loader } from "@monaco-editor/react";
import "./index.css";
import App from "./App";

// Preload Monaco Editor scripts in background so challenge loads instantly
loader.init().catch(() => undefined);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

// Register Service Worker for image caching with auto-update
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("/service-worker.js", { updateViaCache: "none" })
    .then((reg) => {
      console.log("✅ Service Worker registered:", reg.scope);

      // Check for updates every 10 seconds
      const checkInterval = setInterval(() => {
        reg.update().catch(() => {
          // Silently ignore update check failures
        });
      }, 10000);

      // Listen for updates
      reg.addEventListener("updatefound", () => {
        console.log("🔄 Service Worker update found");
      });

      // Cleanup on uninstall
      return () => clearInterval(checkInterval);
    })
    .catch((err) => {
      console.warn("Service Worker registration failed:", err);
    });
}

