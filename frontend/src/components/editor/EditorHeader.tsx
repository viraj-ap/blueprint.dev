import React from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface EditorHeaderProps {
  showAiPanel: boolean;
  setShowAiPanel: (show: boolean) => void;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  readOnly: boolean;
  onUpdatePlan?: (markdown: string) => void;
  onSave: () => void;
}

export const EditorHeader: React.FC<EditorHeaderProps> = ({
  showAiPanel,
  setShowAiPanel,
  isEditing,
  setIsEditing,
  readOnly,
  onUpdatePlan,
  onSave,
}) => {
  return (
    <div className="flex justify-end gap-2 mb-8">
      <Button
        variant={showAiPanel ? "default" : "outline"}
        size="sm"
        className="gap-2 h-7 text-xs"
        onClick={() => setShowAiPanel(!showAiPanel)}
      >
        <Sparkles className="h-3.5 w-3.5" />
        AI Insights
      </Button>
      {!readOnly && onUpdatePlan && (
        <Button
          variant={isEditing ? "default" : "outline"}
          size="sm"
          className="gap-2 h-7 text-xs"
          onClick={() => {
            if (isEditing) onSave();
            else setIsEditing(true);
          }}
        >
          {isEditing ? "Save" : "Edit"}
        </Button>
      )}
    </div>
  );
};
