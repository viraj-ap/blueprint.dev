import React, { useState, useEffect, useRef } from "react";
import { AnnotationType } from "../types";
import { createPortal } from "react-dom";
import { AttachmentsButton } from "./AttachmentsButton";

type PositionMode = "center-above" | "top-right";

interface AnnotationToolbarProps {
  element: HTMLElement;
  positionMode: PositionMode;
  onAnnotate: (
    type: AnnotationType,
    text?: string,
    imagePaths?: string[]
  ) => void;
  onClose: () => void;
  copyText?: string;
  closeOnScrollOut?: boolean;
  isExiting?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onLockChange?: (locked: boolean) => void;
  onOpenWhiteboard?: (callback: (url: string) => void) => void;
}

export const AnnotationToolbar: React.FC<AnnotationToolbarProps> = ({
  element,
  positionMode,
  onAnnotate,
  onClose,
  copyText,
  closeOnScrollOut = false,
  isExiting = false,
  onMouseEnter,
  onMouseLeave,
  onLockChange,
  onOpenWhiteboard,
}) => {
  const [step, setStep] = useState<"menu" | "input">("menu");
  const [activeType, setActiveType] = useState<AnnotationType | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [imagePaths, setImagePaths] = useState<string[]>([]);
  const [position, setPosition] = useState<{
    top: number;
    left?: number;
    right?: number;
  } | null>(null);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Initial position set
  useEffect(() => {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    // Simple positioning logic
    if (positionMode === "center-above") {
      setPosition({
        top: rect.top - 48 + window.scrollY, // Add scrollY if not fixed position
        left: rect.left + rect.width / 2 + window.scrollX,
      });
    }
  }, [element, positionMode]);

  // Better positioning handling
  useEffect(() => {
    const updatePosition = () => {
      const rect = element.getBoundingClientRect();
      // We need to account for scroll if we are strictly using absolute/fixed.
      // If we use fixed, we don't need scrollY.
      // Let's use Fixed positioning for the toolbar to make it easier.

      if (positionMode === "center-above") {
        setPosition({
          top: rect.top - 50,
          left: rect.left + rect.width / 2,
        });
      } else {
        setPosition({
          top: rect.top - 40,
          right: window.innerWidth - rect.right,
        });
      }
    };

    updatePosition();
    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);

    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
    };
  }, [element, positionMode]);

  const handleCopy = async () => {
    let textToCopy = copyText || element.innerText;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  useEffect(() => {
    if (step === "input") inputRef.current?.focus();
  }, [step]);

  useEffect(() => {
    onLockChange?.(step === "input");
  }, [step, onLockChange]);

  if (!position) return null;

  const handleTypeSelect = (type: AnnotationType) => {
    if (type === AnnotationType.DELETION) {
      onAnnotate(type);
    } else {
      setActiveType(type);
      setStep("input");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeType && (inputValue.trim() || imagePaths.length > 0)) {
      onAnnotate(
        activeType,
        inputValue || undefined,
        imagePaths.length > 0 ? imagePaths : undefined
      );
    }
  };

  const handleDrawClick = () => {
    if (onOpenWhiteboard) {
      onOpenWhiteboard((url) => {
        setImagePaths((prev) => [...prev, url]);
      });
    }
  };

  const isCentered = position.left !== undefined;
  const translateX = isCentered ? " translateX(-50%)" : "";

  const style: React.CSSProperties = {
    top: position.top,
    ...(isCentered
      ? { left: position.left, transform: "translateX(-50%)" }
      : { right: position.right }),
    animation: isExiting
      ? "annotation-toolbar-out 0.15s ease-in forwards"
      : "annotation-toolbar-in 0.15s ease-out",
  };

  return createPortal(
    <div
      className="annotation-toolbar fixed z-100 bg-popover text-popover-foreground border border-border rounded-lg shadow-2xl"
      style={style}
      onMouseDown={(e) => e.stopPropagation()}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <style>{`
        @keyframes annotation-toolbar-in {
          from { opacity: 0; transform: translateY(12px)${translateX}; }
          to { opacity: 1; transform: translateY(0)${translateX}; }
        }
        @keyframes annotation-toolbar-out {
          from { opacity: 1; transform: translateY(0)${translateX}; }
          to { opacity: 0; transform: translateY(8px)${translateX}; }
        }
      `}</style>
      {step === "menu" ? (
        <div className="flex items-center p-1 gap-0.5">
          <ToolbarButton
            onClick={handleCopy}
            icon={copied ? <CheckIcon /> : <CopyIcon />}
            label={copied ? "Copied!" : "Copy"}
            className={
              copied
                ? "text-green-500"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            }
          />
          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          <ToolbarButton
            onClick={() => handleTypeSelect(AnnotationType.DELETION)}
            icon={<TrashIcon />}
            label="Delete"
            className="text-red-500 hover:bg-red-50"
          />
          <ToolbarButton
            onClick={() => handleTypeSelect(AnnotationType.COMMENT)}
            icon={<CommentIcon />}
            label="Comment"
            className="text-amber-500 hover:bg-amber-50"
          />
          <div className="w-px h-5 bg-gray-200 mx-0.5" />
          <ToolbarButton
            onClick={onClose}
            icon={<CloseIcon />}
            label="Cancel"
            className="text-gray-500 hover:bg-gray-100"
          />
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="flex items-start gap-1.5 p-1.5 pl-3"
        >
          <textarea
            ref={inputRef}
            rows={1}
            className="bg-transparent text-sm min-w-44 max-w-80 max-h-32 placeholder:text-muted-foreground resize-none px-2 py-1.5 focus:outline-none focus:bg-muted/30"
            style={{ fieldSizing: "content" } as React.CSSProperties}
            placeholder="Add a comment..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setStep("menu");
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (inputValue.trim() || imagePaths.length > 0) {
                  onAnnotate(
                    activeType!,
                    inputValue || undefined,
                    imagePaths.length > 0 ? imagePaths : undefined
                  );
                }
              }
            }}
          />

          {/* Draw Button */}
          <button
            type="button"
            onClick={handleDrawClick}
            className="flex items-center justify-center p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            title="Draw"
          >
            <PenToolIcon />
          </button>

          <AttachmentsButton
            paths={imagePaths}
            onAdd={(path) => setImagePaths((prev) => [...prev, path])}
            onRemove={(path) =>
              setImagePaths((prev) => prev.filter((p) => p !== path))
            }
          />
          <button
            type="submit"
            disabled={!inputValue.trim() && imagePaths.length === 0}
            className="px-[15px] py-1 text-xs font-medium rounded bg-blue-600 text-white hover:opacity-90 disabled:opacity-50 transition-opacity self-stretch"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => setStep("menu")}
            className="p-1 rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <CloseIcon small />
          </button>
        </form>
      )}
    </div>,
    document.body
  );
};

// Icons
const PenToolIcon = () => (
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
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);

// Icons
const CopyIcon = () => (
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
      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
    />
  </svg>
);

const CheckIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

const TrashIcon = () => (
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
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);

const CommentIcon = () => (
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
      d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
    />
  </svg>
);

const CloseIcon: React.FC<{ small?: boolean }> = ({ small }) => (
  <svg
    className={small ? "w-3.5 h-3.5" : "w-4 h-4"}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

const ToolbarButton: React.FC<{
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  className: string;
}> = ({ onClick, icon, label, className }) => (
  <button
    onClick={onClick}
    title={label}
    className={`p-1.5 rounded-md transition-colors ${className}`}
  >
    {icon}
  </button>
);
