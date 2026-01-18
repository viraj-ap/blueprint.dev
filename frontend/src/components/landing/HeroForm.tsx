import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TEMPLATES, type Template } from "@/lib/templates";

interface HeroFormProps {
  mode: "generate" | "import";
  setMode: (mode: "generate" | "import") => void;
  userName: string;
  setUserName: (name: string) => void;
  prompt: string;
  setPrompt: (prompt: string) => void;
  markdownInput: string;
  setMarkdownInput: (input: string) => void;
  isLoading: boolean;
  onGenerate: () => void;
  onTemplateSelect: (template: Template) => void;
}

export const HeroForm: React.FC<HeroFormProps> = ({
  mode,
  setMode,
  userName,
  setUserName,
  prompt,
  setPrompt,
  markdownInput,
  setMarkdownInput,
  isLoading,
  onGenerate,
  onTemplateSelect,
}) => {
  return (
    <section className="min-h-[90vh] flex items-center px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">
        {/* Left: Hero Image */}
        <div className="flex justify-center">
          <img
            src="/hero.png"
            className="w-full h-96 scale-130 dark:invert"
            alt="Hero"
          />
        </div>

        {/* Right: Form */}
        <Card className="w-full max-w-md mx-auto">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center gap-2">
              <div>
                <img src="/logo.png" alt="" className="h-32" />
              </div>
              <h1 className="text-4xl font-bold">
                <span className="text-blue-500">blueprint</span>.dev
              </h1>
            </div>

            <p className="text-muted-foreground">
              Collaborative AI agent planning workspace.
            </p>

            <div className="flex bg-muted p-1 rounded-lg mb-4">
              <button
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  mode === "generate"
                    ? "bg-background shadow text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setMode("generate")}
              >
                ✨ AI Generate
              </button>
              <button
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  mode === "import"
                    ? "bg-background shadow text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                onClick={() => setMode("import")}
              >
                📥 Import Markdown
              </button>
            </div>

            <Input
              placeholder="Your Name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
            />

            {mode === "generate" ? (
              <>
                <Textarea
                  placeholder="What do you want to build?"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[100px]"
                />

                <div className="flex gap-2 overflow-x-auto pb-2">
                  {TEMPLATES.map((t) => (
                    <Button
                      key={t.id}
                      variant="secondary"
                      size="sm"
                      onClick={() => onTemplateSelect(t)}
                      className="whitespace-nowrap"
                    >
                      {t.name}
                    </Button>
                  ))}
                </div>
              </>
            ) : (
              <Textarea
                className="min-h-[160px] font-mono text-xs"
                placeholder="# My System Design..."
                value={markdownInput}
                onChange={(e) => setMarkdownInput(e.target.value)}
              />
            )}

            <Button
              className="w-full"
              onClick={onGenerate}
              disabled={isLoading}
            >
              {isLoading
                ? mode === "generate"
                  ? "Generating..."
                  : "Importing..."
                : mode === "generate"
                  ? "Generate & Start"
                  : "Import & Start"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
