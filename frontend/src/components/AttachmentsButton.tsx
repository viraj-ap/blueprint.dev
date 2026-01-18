import React, { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { ImageThumbnail } from "./ImageThumbnail";

interface AttachmentsButtonProps {
  paths: string[];
  onAdd: (path: string) => void;
  onRemove: (path: string) => void;
}

export const AttachmentsButton: React.FC<AttachmentsButtonProps> = ({
  paths,
  onAdd,
  onRemove,
}) => {
  // In this simplified version, we'll just use a file input for uploads or just mock it,
  // or maybe just a text input for URLs since backend upload might not be ready.
  // For now, let's just allow pasting URLs.

  const [isOpen, setIsOpen] = useState(false);
  const [manualPath, setManualPath] = useState("");
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const toggleOpen = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        left: Math.max(8, rect.left - 100),
      });
    }
    setIsOpen(!isOpen);
  };

  const handleManualAdd = () => {
    if (manualPath.trim()) {
      onAdd(manualPath.trim());
      setManualPath("");
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={toggleOpen}
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
          />
        </svg>
        {paths.length > 0 && <span>{paths.length}</span>}
      </button>

      {isOpen &&
        createPortal(
          <>
            <div
              className="fixed inset-0 z-90"
              onClick={() => setIsOpen(false)}
            />
            <div
              className="fixed z-100 w-72 bg-popover text-popover-foreground border border-border rounded-xl shadow-2xl p-3"
              style={{ top: position.top, left: position.left }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-3">
                <div className="text-sm font-medium">Attachments</div>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={manualPath}
                    onChange={(e) => setManualPath(e.target.value)}
                    placeholder="Paste image URL..."
                    className="flex-1 px-2 py-1.5 text-xs bg-background text-foreground border border-input rounded-md focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button
                    onClick={handleManualAdd}
                    className="px-2 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                  >
                    Add
                  </button>
                </div>

                {paths.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {paths.map((path) => (
                      <ImageThumbnail
                        key={path}
                        path={path}
                        size="md"
                        onRemove={() => onRemove(path)}
                        showRemove
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </>,
          document.body
        )}
    </>
  );
};
