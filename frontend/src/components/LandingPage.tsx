import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { Navbar } from "./landing/Navbar";
import { BentoGrid } from "./landing/BentoGrid";
import { Footer } from "./landing/Footer";
import { HeroForm } from "./landing/HeroForm";
import { type Template } from "@/lib/templates";

const LandingPage: React.FC = () => {
  const [mode, setMode] = useState<"generate" | "import">("generate");
  const [userName, setUserName] = useState("");
  const [prompt, setPrompt] = useState("");
  const [markdownInput, setMarkdownInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);
  const [joinSessionId, setJoinSessionId] = useState("");
  const navigate = useNavigate();

  const handleJoinSession = () => {
    if (!userName || !joinSessionId)
      return alert("Please enter name and session ID");
    localStorage.setItem("userName", userName);
    navigate(`/session/${joinSessionId}`);
  };

  const handleGenerate = async () => {
    if (!userName) return alert("Please enter your name");

    setIsLoading(true);
    try {
      let res;
      if (mode === "import") {
        if (!markdownInput) {
          alert("Please paste your markdown content.");
          setIsLoading(false);
          return;
        }
        res = await axios.post(
          "http://localhost:5000/api/session-from-markdown",
          {
            content: markdownInput,
            projectTitle: "Imported Plan",
          },
        );
      } else {
        if (!prompt) {
          alert("Please describe what you want to build.");
          setIsLoading(false);
          return;
        }
        res = await axios.post("http://localhost:5000/api/generate-session", {
          prompt,
        });
      }

      if (res.data.success) {
        localStorage.setItem("userName", userName);
        navigate(`/session/${res.data.sessionId}`);
      }
    } catch {
      alert("Failed to generate plan");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    if (!userName) return alert("Please enter your name");

    const sessionId = `${template.id}-${Date.now().toString().slice(-6)}`;
    localStorage.setItem(`pendingSession_${sessionId}`, template.content);
    localStorage.setItem("userName", userName);

    navigate(`/session/${sessionId}`);
  };

  return (
    <div className="bg-background text-foreground">
      <Navbar onJoinClick={() => setJoinOpen(true)} />

      <HeroForm
        mode={mode}
        setMode={setMode}
        userName={userName}
        setUserName={setUserName}
        prompt={prompt}
        setPrompt={setPrompt}
        markdownInput={markdownInput}
        setMarkdownInput={setMarkdownInput}
        isLoading={isLoading}
        onGenerate={handleGenerate}
        onTemplateSelect={handleTemplateSelect}
      />

      <BentoGrid />
      <Footer />

      {/* Join Dialog */}
      <Dialog open={joinOpen} onOpenChange={setJoinOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Join a Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Display Name
              </label>
              <Input
                placeholder="Your Name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Session ID
              </label>
              <Input
                placeholder="e.g. template-123456"
                value={joinSessionId}
                onChange={(e) => setJoinSessionId(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleJoinSession}>
              Enter Workspace
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LandingPage;
