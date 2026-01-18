import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface JoinDialogProps {
  open: boolean;
  onJoin: (name: string) => void;
}

export const JoinDialog: React.FC<JoinDialogProps> = ({ open, onJoin }) => {
  const [nameInput, setNameInput] = useState("");

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onJoin(nameInput.trim());
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Welcome to blueprint.dev</DialogTitle>
          <DialogDescription>
            Please enter your name to join the session and start collaborating.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleNameSubmit} className="flex flex-col gap-4 mt-4">
          <div className="flex flex-col gap-2">
            <Input
              id="name"
              placeholder="Enter your name..."
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              autoFocus
            />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={!nameInput.trim()}>
              Join Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
