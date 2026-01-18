import React from "react";
import { Card } from "@/components/ui/card";
import AIAssistantPanel from "@/components/AIAssistantPanel";
import { useHighlighter } from "@/hooks/useHighlighter";

import { EditorHeader } from "@/components/editor/EditorHeader";
import { EditorContent } from "@/components/editor/EditorContent";

interface EditorViewProps {
  markdown?: string;
  readOnly?: boolean;
  onUpdatePlan?: (markdown: string) => void;
  onAddAnnotation?: (annotation: any) => void;
  annotations?: any[];
}

export default function EditorView({
  markdown = "",
  readOnly = false,
  onUpdatePlan,
  onAddAnnotation,
  annotations = [],
}: EditorViewProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [value, setValue] = React.useState(markdown);
  const [showAiPanel, setShowAiPanel] = React.useState(false);

  // AI Panel State
  const [aiHighlights, setAiHighlights] = React.useState<any[]>([]);
  const [activeTab, setActiveTab] = React.useState("security");

  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  // Merge saved annotations and temporary AI highlights
  const allHighlights = React.useMemo(() => {
    return [...annotations, ...aiHighlights];
  }, [annotations, aiHighlights]);

  useHighlighter(containerRef, allHighlights, (id) => {
    console.log("Clicked annotation:", id);
  });

  // Sync value with prop
  React.useEffect(() => {
    if (!isEditing) setValue(markdown);
  }, [markdown, isEditing]);

  const handleNavigate = (text: string) => {
    if (!containerRef.current) return;
    const elements = containerRef.current.querySelectorAll(
      ".annotation-highlight",
    );
    for (const el of elements) {
      if (
        el.textContent?.includes(text) ||
        text.includes(el.textContent || "")
      ) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
        return;
      }
    }
    alert("Could not locate text section.");
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const containerRect = scrollContainerRef.current.getBoundingClientRect();
    const center = containerRect.top + containerRect.height / 2;

    const highlights = document.querySelectorAll(".annotation-highlight");
    let foundType = null;

    for (const mark of highlights) {
      const rect = mark.getBoundingClientRect();
      if (rect.top <= center && rect.bottom >= center) {
        const bindId = (mark as HTMLElement).dataset.bindId;
        const hl = aiHighlights.find((h) => h.id === bindId);
        if (hl) {
          foundType = hl.type;
          break;
        }
      }
    }

    if (foundType) {
      if (foundType === "SECURITY" && activeTab !== "security")
        setActiveTab("security");
      else if (foundType === "LOGIC" && activeTab !== "consistency")
        setActiveTab("consistency");
      else if (foundType === "RISK" && activeTab !== "risk")
        setActiveTab("risk");
    }
  };

  const handleSave = () => {
    if (onUpdatePlan) onUpdatePlan(value);
    setIsEditing(false);
  };

  return (
    <div className="w-full h-full overflow-hidden flex bg-grid-pattern relative">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-8 flex justify-center scroll-smooth"
        onScroll={handleScroll}
      >
        <div className="max-w-4xl w-full pb-20">
          <Card className="min-h-[800px] w-full bg-background shadow-sm border p-12 relative">
            <EditorHeader
              showAiPanel={showAiPanel}
              setShowAiPanel={setShowAiPanel}
              isEditing={isEditing}
              setIsEditing={setIsEditing}
              readOnly={readOnly}
              onUpdatePlan={onUpdatePlan}
              onSave={handleSave}
            />

            <EditorContent
              isEditing={isEditing}
              value={value}
              setValue={setValue}
              markdown={markdown}
              containerRef={containerRef as React.RefObject<HTMLDivElement>}
            />
          </Card>
        </div>
      </div>

      {showAiPanel && (
        <AIAssistantPanel
          markdown={value}
          onAddAnnotation={onAddAnnotation}
          onHighlightsUpdate={setAiHighlights}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onNavigate={handleNavigate}
        />
      )}
    </div>
  );
}
