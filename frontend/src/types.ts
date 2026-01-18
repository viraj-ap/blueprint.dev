
export const AnnotationType = {
  DELETION: 'DELETION',
  INSERTION: 'INSERTION',
  REPLACEMENT: 'REPLACEMENT',
  COMMENT: 'COMMENT',
  GLOBAL_COMMENT: 'GLOBAL_COMMENT',
} as const;

export type AnnotationType = typeof AnnotationType[keyof typeof AnnotationType];

export interface Annotation {
  id: string;
  type: AnnotationType;
  text?: string;
  originalText: string;
  createdA: number;
  author?: string;
  authorName?: string;
  imagePaths?: string[];
  blockId?: string; // Optional linkage to a step/block
  // Legacy fields from original type to keep compatibility if needed, though likely unused now
  userId?: string;
  content?: string;
  targetId?: string;
  color?: string;
}

export interface Block {
  id: string;
  content: string;
}

export interface Comment {
  id: string;
  userId: string;
  stepId: string | null;
  content: string;
  timestamp: string;
  isAiGenerated: boolean;
}

export interface PlanStep {
  id: string;
  title: string;
  description: string;
  techStack: string[];
  status: "pending" | "approved" | "rejected";
}

export interface User {
  userId: string;
  name: string;
  color: string;
}

export interface Session {
  sessionId: string;
  projectTitle: string;
  content?: string;
  steps: PlanStep[];
  activeUsers: User[];
  comments: Comment[];
  annotations?: Annotation[];
  createdAt: string;
}

export interface CursorPosition {
  userId: string;
  x: number;
  y: number;
  name: string;
  color: string;
}
