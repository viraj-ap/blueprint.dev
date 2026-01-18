import React from "react";
import ReactMarkdown from "react-markdown";

interface EditorContentProps {
  isEditing: boolean;
  value: string;
  setValue: (value: string) => void;
  markdown: string;
  containerRef: React.RefObject<HTMLDivElement>;
}

export const EditorContent: React.FC<EditorContentProps> = ({
  isEditing,
  value,
  setValue,
  markdown,
  containerRef,
}) => {
  return (
    <div
      ref={containerRef}
      className="prose prose-gray max-w-none dark:prose-invert prose-headings:font-bold prose-h1:text-4xl prose-h2:text-2xl prose-h3:text-xl prose-p:text-base prose-p:leading-7 prose-pre:bg-zinc-100 dark:prose-pre:bg-zinc-900 prose-pre:text-zinc-900 dark:prose-pre:text-zinc-50 prose-pre:border prose-pre:text-sm"
    >
      {isEditing ? (
        <textarea
          className="w-full h-[600px] p-4 bg-muted/20 border rounded-md font-mono text-sm resize-y focus:outline-none focus:ring-2 focus:ring-primary/50"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
      ) : markdown ? (
        <ReactMarkdown>{markdown}</ReactMarkdown>
      ) : (
        <div className="text-center text-muted-foreground mt-20">
          <p>No content yet.</p>
        </div>
      )}
    </div>
  );
};
