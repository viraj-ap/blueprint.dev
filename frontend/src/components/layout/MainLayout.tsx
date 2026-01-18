import { useState, useRef, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Moon,
  Sun,
  Monitor,
  Share2,
  Layers,
  MessageSquarePlus,
  Copy,
  Check,
  Link as LinkIcon,
  PenTool,
  X,
  Sparkles,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import type { Annotation } from "../../types";
import { AnnotationType } from "../../types";
import { AnnotationPanel } from "../AnnotationPanel";
import { AnnotationToolbar } from "../AnnotationToolbar";
import { v4 as uuidv4 } from "uuid";
import { useHighlighter } from "../../hooks/useHighlighter";
import CursorOverlay from "../CursorOverlay";
import Whiteboard, { type WhiteboardRef } from "../Whiteboard";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import axios from "axios";
import { ImageThumbnail } from "../ImageThumbnail";

interface MainLayoutProps {
  children: ReactNode;
  annotations?: Annotation[];
  onAddAnnotation?: (annotation: Annotation) => void;
  onDeleteAnnotation?: (id: string) => void;
  currentUser?: { userId: string; name?: string };
  markdown?: string;
  onShare?: () => void;
  cursors?: any[]; // Using any[] for now to match imported type loosely or we can import CursorPosition
  onMouseMove?: (e: React.MouseEvent) => void;
  onUpdateMarkdown?: (markdown: string) => void;
  sessionId?: string;
}

export default function MainLayout({
  children,
  annotations = [],
  onAddAnnotation,
  onDeleteAnnotation,
  currentUser,
  markdown = "",
  onShare,
  cursors = [],
  onMouseMove,
  onUpdateMarkdown,
  sessionId,
}: MainLayoutProps) {
  const { setTheme, theme } = useTheme();

  const containerRef = useRef<HTMLElement>(null);

  // Visual highlighting - Must be called before handleAnnotate
  const { renderAnnotations } = useHighlighter(containerRef, annotations);

  const [mode, setMode] = useState<"selection" | "redline">("selection");
  const [showGlobalCommentInput, setShowGlobalCommentInput] = useState(false);
  const [globalCommentValue, setGlobalCommentValue] = useState("");
  const [globalImagePaths, setGlobalImagePaths] = useState<string[]>([]);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkInputValue, setLinkInputValue] = useState("");
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const whiteboardRef = useRef<WhiteboardRef>(null);

  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(false);

  const [selection, setSelection] = useState<{
    range: Range;
    text: string;
    element: HTMLElement;
  } | null>(null);

  const handleAnnotate = (
    type: AnnotationType,
    text?: string,
    imagePaths?: string[],
    range?: Range,
    originalText?: string
  ) => {
    // If we are passing specific range/text (e.g. from Redline auto-mode), use them
    // otherwise fallback to current selection state
    const textToAnnotate = originalText || selection?.text || "";
    const rangeToUse = range || selection?.range;

    if (!selection && !rangeToUse && type !== AnnotationType.GLOBAL_COMMENT)
      return;

    const newAnnotation: Annotation = {
      id: uuidv4(),
      type,
      text,
      originalText: textToAnnotate,
      createdA: Date.now(),
      author: currentUser?.userId || "anonymous",
      authorName: currentUser?.name || "Anonymous",
      imagePaths,
      // content: text, // legacy
      // userId: currentUser?.userId || 'anonymous' // legacy
    };

    if (onAddAnnotation) {
      onAddAnnotation(newAnnotation);
      // Small delay to allow state update then re-render highlights
      setTimeout(() => renderAnnotations(), 50);
    }

    setSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleCopyPlan = async () => {
    if (!markdown) return;
    try {
      await navigator.clipboard.writeText(markdown);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy plan:", err);
    }
  };

  const handleShareClick = async () => {
    if (onShare) {
      onShare();
      setShared(true);
      setTimeout(() => setShared(false), 2000);
    }
  };

  const handleAddGlobalComment = () => {
    if (!globalCommentValue.trim() && globalImagePaths.length === 0) return;

    // Calls handleAnnotate but specific for Global Comment
    handleAnnotate(
      AnnotationType.GLOBAL_COMMENT,
      globalCommentValue.trim(),
      globalImagePaths
    );

    setGlobalCommentValue("");
    setGlobalImagePaths([]);
    setShowGlobalCommentInput(false);
  };

  const [whiteboardCallback, setWhiteboardCallback] = useState<
    ((url: string) => void) | null
  >(null);

  const handleSaveWhiteboard = async () => {
    console.log("Saving whiteboard...", { hasCallback: !!whiteboardCallback });
    if (!whiteboardRef.current) return;
    setIsUploading(true);
    try {
      const blob = await whiteboardRef.current.exportImage();
      if (blob) {
        const formData = new FormData();
        formData.append("image", blob, "drawing.png");

        const res = await axios.post(
          "http://localhost:5000/api/upload",
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );

        console.log("Upload response:", res.data);

        if (res.data.url) {
          if (whiteboardCallback) {
            console.log("Executing whiteboard callback with URL");
            whiteboardCallback(res.data.url);
            setWhiteboardCallback(null);
          } else {
            console.log("Adding to global image paths");
            setGlobalImagePaths((prev) => [...prev, res.data.url]);
            // Ensure comment input is open to show the attachment
            setShowGlobalCommentInput(true);
          }
          setIsWhiteboardOpen(false);
        } else {
          console.error("No URL in response");
          alert("Upload failed: No URL returned");
        }
      } else {
        console.error("Failed to export blob");
      }
    } catch (e) {
      console.error("Failed to upload drawing", e);
      alert("Failed to upload drawing. Check console.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddLink = () => {
    if (linkInputValue.trim()) {
      setGlobalImagePaths((prev) => [...prev, linkInputValue.trim()]);
      setLinkInputValue("");
      setShowLinkInput(false);
    }
  };

  const [isEnhancing, setIsEnhancing] = useState(false);

  // ... (previous code)

  const handleEnhanceWithGemini = async () => {
    if (!markdown || isEnhancing) return;
    setIsEnhancing(true);
    try {
      // Extract simplified annotations
      const simplifiedAnnotations = annotations.map((a) => ({
        type: a.type,
        text: a.text,
        originalText: a.originalText,
        authorName: a.authorName,
        createdA: new Date(a.createdA).toISOString(),
      }));

      const res = await axios.post("http://localhost:5000/api/enhance", {
        content: markdown,
        annotations: simplifiedAnnotations,
      });

      if (res.data.success && onUpdateMarkdown) {
        onUpdateMarkdown(res.data.content);
        // Maybe show a success toast?
        alert("Plan enhanced with Gemini AI!");
      }
    } catch (error) {
      console.error("Enhancement failed", error);
      alert("Failed to enhance plan with Gemini.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleMouseUp = () => {
    // ... (existing handleMouseUp code)
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      setSelection(null);
      return;
    }

    const range = sel.getRangeAt(0);
    const text = sel.toString().trim();
    if (!text) {
      setSelection(null);
      return;
    }

    // Ensure selection is within our main content
    if (
      containerRef.current &&
      !containerRef.current.contains(range.commonAncestorContainer)
    ) {
      return;
    }

    // Since we don't have block IDs in the generic EditorView, we'll attach to the container or just use generic text
    // ideally we would find the closest block element.
    let element = range.commonAncestorContainer as HTMLElement;
    if (element.nodeType === Node.TEXT_NODE) {
      element = element.parentElement as HTMLElement;
    }

    // Redline Mode: Auto-delete
    if (mode === "redline") {
      handleAnnotate(
        AnnotationType.DELETION,
        undefined,
        undefined,
        range,
        text
      );
      return;
    }

    setSelection({
      range,
      text,
      element,
    });
  };

  return (
    <div
      className="flex flex-col h-screen w-full bg-background relative overflow-hidden"
      onMouseMove={onMouseMove}
    >
      <CursorOverlay cursors={cursors} />
      {/* Top Header */}
      <header className="flex h-14 items-center justify-between border-b px-4 bg-background z-50">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-lg tracking-tight">
            <span className="text-blue-600">blueprint</span>.dev
          </span>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 bg-purple-50 hover:bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 dark:border-purple-800 dark:text-purple-300 transition-all font-medium"
            onClick={handleEnhanceWithGemini}
            disabled={isEnhancing}
          >
            <Sparkles
              className={`w-3.5 h-3.5 ${isEnhancing ? "animate-spin" : ""}`}
            />
            {isEnhancing ? "Refining..." : "Apply changes with Gemini"}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleShareClick}
          >
            {shared ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Share2 className="h-4 w-4" />
            )}
            {shared ? "Copied Link" : "Share"}
          </Button>

          {/* Global Comment */}
          {showGlobalCommentInput ? (
            <div className="flex flex-col gap-2 bg-muted/80 backdrop-blur-md rounded-md p-2 animate-in fade-in slide-in-from-top-1 absolute top-14 right-4 z-[60] border shadow-lg w-80">
              {/* Image Preview */}
              {globalImagePaths.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-1">
                  {globalImagePaths.map((path, idx) => (
                    <ImageThumbnail
                      key={idx}
                      path={path}
                      size="sm"
                      onRemove={() =>
                        setGlobalImagePaths((prev) =>
                          prev.filter((_, i) => i !== idx)
                        )
                      }
                      showRemove
                    />
                  ))}
                </div>
              )}

              <textarea
                className="text-sm bg-transparent dark:text-white px-2 py-1 min-h-[60px] outline-none resize-none border-b border-gray-200/20"
                placeholder="Global comment..."
                value={globalCommentValue}
                onChange={(e) => setGlobalCommentValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleAddGlobalComment();
                  }
                  if (e.key === "Escape") setShowGlobalCommentInput(false);
                }}
                autoFocus
              />

              {/* Actions */}
              <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-1">
                  {/* Link Toggle */}
                  {showLinkInput ? (
                    <div className="flex items-center gap-1 bg-background rounded border px-1">
                      <input
                        className="h-6 text-xs bg-transparent w-32 outline-none"
                        placeholder="https://..."
                        value={linkInputValue}
                        onChange={(e) => setLinkInputValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleAddLink();
                        }}
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5"
                        onClick={handleAddLink}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-5 w-5"
                        onClick={() => setShowLinkInput(false)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={() => setShowLinkInput(true)}
                      title="Add Image Link"
                    >
                      <LinkIcon className="h-4 w-4 text-foreground" />
                    </Button>
                  )}

                  {/* Draw Button */}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 w-7 p-0"
                    onClick={() => {
                      setWhiteboardCallback(null);
                      setIsWhiteboardOpen(true);
                    }}
                    title="Draw"
                  >
                    <PenTool className="h-4 w-4 text-foreground" />
                  </Button>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowGlobalCommentInput(false)}
                    className="text-xs h-7"
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddGlobalComment}
                    className="h-7 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => {
                  setWhiteboardCallback(null);
                  setIsWhiteboardOpen(true);
                }}
                title="Draw"
              >
                <PenTool className="h-4 w-4" />
                <span className="hidden sm:inline">Draw</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="gap-2"
                onClick={() => setShowGlobalCommentInput(true)}
              >
                <MessageSquarePlus className="h-4 w-4" />
                <span className="hidden sm:inline">Comment</span>
              </Button>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={handleCopyPlan}
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
            {copied ? "Copied" : "Copy Plan"}
          </Button>

          {/* Avatar Removed */}
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content Area */}
        <main
          ref={containerRef}
          className={`flex-1 relative overflow-hidden bg-muted/10 ${mode === "redline"
            ? "cursor-text selection:bg-red-200 selection:text-red-900"
            : "selection:bg-blue-200 selection:text-blue-900"
            }`}
          onMouseUp={handleMouseUp}
        >
          {/* Toolbar Overlay (Top Center) */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-40 bg-background/80 backdrop-blur border rounded-full px-2 py-1 shadow-sm flex items-center gap-1">
            <Button
              variant={mode === "selection" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-full gap-2 h-8 px-3 data-[active=true]:bg-accent"
              onClick={() => setMode("selection")}
            >
              <Monitor className="h-3.5 w-3.5" />
              Selection
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <Button
              variant={mode === "redline" ? "secondary" : "ghost"}
              size="sm"
              className="rounded-full gap-2 h-8 px-3"
              onClick={() => setMode("redline")}
            >
              <Layers className="h-3.5 w-3.5" />
              Redline
            </Button>
          </div>

          {children}
        </main>

        {/* Right Sidebar (Annotations) */}
        <aside className="w-80 border-l bg-background flex flex-col h-full">
          <AnnotationPanel
            isOpen={true}
            annotations={annotations}
            blocks={[]}
            onSelect={(id) => {
              // Scroll to annotation
              // We look for the mark with data-bind-id
              const mark = document.querySelector(`mark[data-bind-id="${id}"]`);
              if (mark) {
                mark.scrollIntoView({ behavior: "smooth", block: "center" });
                // Optional: Flash highlights?
              } else {
                console.log("Mark not found for annotation", id);
              }
            }}
            onDelete={(id) => {
              if (onDeleteAnnotation) {
                onDeleteAnnotation(id);
              }
            }}
            selectedId={null}
          />
        </aside>
      </div>

      {/* Floating Annotation Toolbar */}
      {selection && (
        <AnnotationToolbar
          element={selection.element}
          positionMode="center-above"
          onAnnotate={handleAnnotate}
          onClose={() => setSelection(null)}
          copyText={selection.text}
          onOpenWhiteboard={(callback) => {
            setWhiteboardCallback(() => callback);
            setIsWhiteboardOpen(true);
          }}
        />
      )}
      {/* Whiteboard Modal */}
      <Dialog open={isWhiteboardOpen} onOpenChange={setIsWhiteboardOpen}>
        <DialogContent className="max-w-[90vw] h-[90vh] p-0 overflow-hidden bg-background">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between px-4 py-2 border-b bg-muted/30">
              <span className="font-semibold text-sm">Draw</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsWhiteboardOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSaveWhiteboard}
                  disabled={isUploading}
                >
                  {isUploading ? "Saving..." : "Save to Comment"}
                </Button>
              </div>
            </div>
            <div className="flex-1 relative overflow-hidden">
              <Whiteboard
                ref={whiteboardRef}
                theme={theme === "dark" ? "dark" : "light"}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
