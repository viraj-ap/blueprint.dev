import { useState, forwardRef, useImperativeHandle } from "react";
import { Excalidraw, exportToBlob } from "@excalidraw/excalidraw";
// @ts-ignore
import type { ExcalidrawImperativeAPI } from "@excalidraw/excalidraw/types";
import "@excalidraw/excalidraw/index.css";
import "./Whiteboard.css";

interface WhiteboardProps {
  initialData?: any;
  theme?: "light" | "dark";
}

export interface WhiteboardRef {
  exportImage: () => Promise<Blob | null>;
}

const Whiteboard = forwardRef<WhiteboardRef, WhiteboardProps>(
  ({ initialData, theme = "light" }, ref) => {
    const [excalidrawAPI, setExcalidrawAPI] =
      useState<ExcalidrawImperativeAPI | null>(null);

    useImperativeHandle(ref, () => ({
      exportImage: async () => {
        if (!excalidrawAPI) return null;
        try {
          const blob = await exportToBlob({
            elements: excalidrawAPI.getSceneElements(),
            appState: {
              ...excalidrawAPI.getAppState(),
              exportWithDarkMode: theme === "dark",
            },
            files: excalidrawAPI.getFiles(),
            getDimensions: (width: any, height: any) => {
              // Use default dimensions if none provided, or fall back to a reasonable default
              return { width: width || 800, height: height || 600 };
            },
          });
          return blob;
        } catch (error) {
          console.error("Error exporting image:", error);
          return null;
        }
      },
    }));

    return (
      <div
        className="whiteboard-container"
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100%",
          width: "100%",
        }}
      >
        <div style={{ height: "100%", width: "100%", position: "relative" }}>
          <Excalidraw
            excalidrawAPI={(api) => setExcalidrawAPI(api)}
            initialData={initialData}
            theme={theme}
            UIOptions={{
              canvasActions: {
                saveToActiveFile: false,
                loadScene: false,
                export: false,
                saveAsImage: false,
              },
            }}
          />
        </div>
      </div>
    );
  }
);

export default Whiteboard;
