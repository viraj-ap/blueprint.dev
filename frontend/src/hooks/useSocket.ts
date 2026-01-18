import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import type { Session, CursorPosition, Comment, Annotation } from "../types";

const SOCKET_URL = "http://localhost:5000";

export const useSocket = (
  sessionId: string | undefined,
  user: { name: string; id: string; color: string }
) => {
  const socketRef = useRef<Socket | null>(null);
  const [sessionState, setSessionState] = useState<Session | null>(null);
  const [cursors, setCursors] = useState<CursorPosition[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [latestPlanMarkdown, setLatestPlanMarkdown] = useState<string | null>(
    null
  );
  const [latestAnnotations, setLatestAnnotations] = useState<Annotation[]>([]);

  useEffect(() => {
    if (!sessionId) return;

    socketRef.current = io(SOCKET_URL);

    const socket = socketRef.current;

    socket.on("connect", () => {
      console.log("Connected to socket");
      setIsConnected(true);
      socket.emit("join_room", { sessionId, user });
    });

    socket.on("init_state", (state: Session) => {
      console.log("Received init_state", state);
      console.log("Received init_state", state);
      setSessionState(state);
      if (state.annotations) {
        setLatestAnnotations(state.annotations);
      }
    });

    socket.on("cursor_move", (data: CursorPosition) => {
      setCursors((prev) => {
        // Update or add cursor
        const otherCursors = prev.filter((c) => c.userId !== data.userId);
        return [...otherCursors, data];
      });
    });

    socket.on("new_comment", ({ comment }: { comment: Comment }) => {
      setSessionState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [...prev.comments, comment],
        };
      });
    });

    socket.on("bot_intervention", ({ comment }: { comment: Comment }) => {
      setSessionState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          comments: [...prev.comments, comment],
        };
      });
    });

    socket.on("plan_updated", ({ markdown }) => {
      setSessionState((prev) => {
        if (!prev) return null;
        // Currently sessionState.steps holds the structured plan.
        // Since we are moving to Markdown-first editing in real-time,
        // we might need to store the raw markdown in the session state
        // OR we just rely on the 'initialMarkdown' derived from steps
        // BUT if we want real-time sync, we need to update the session state
        // to reflect the new markdown so 'convertSessionToMarkdown' isn't stale
        // OR we just pass the markdown through directly.
        //
        // Problem: 'Session' type has 'steps', not 'markdown'.
        // If we want to sync raw markdown, we should probably update the Session type
        // or just hack it for now by updating our local derived state?
        // Actually, for this component refactor, we are likely treating the Session
        // as the source of truth. If the server broadcasts 'plan_updated' with markdown,
        // we should probably have a way to inject it.
        //
        // However, 'Editor' takes 'initialMarkdown'.
        // If we change 'sessionState', 'initialMarkdown' changes.
        // We need to parse the markdown BACK into steps if we want to update 'sessionState.steps'.
        // OR we temporarily add a 'markdown' field to sessionState?
        // Let's assume the server broadcasts the UPDATED steps or we parse it here?
        //
        // Simplest path: The server should broadcast the `markdown` string.
        // The `useSocket` should probably expose `markdown` separately if it's not in `Session`.
        // But `convertSessionToMarkdown` is one-way (Session -> MD).
        //
        // If we want FULL sync:
        // 1. Client A edits Markdown -> emits 'update_plan' (markdown string).
        // 2. Server broadcasts 'plan_updated' (markdown string).
        // 3. Client B receives 'plan_updated'.
        //
        // We need to pass this new markdown to SessionPage -> Editor.
        // But SessionPage uses `convertSessionToMarkdown(sessionState)`.
        // IF we don't update `sessionState`, `initialMarkdown` won't change.
        // IF we leave `sessionState` stale, `Editor` might get confused.
        //
        // BETTER APPROACH FOR NOW:
        // Expose `latestPlanMarkdown` from `useSocket`.
        return prev;
      });
      // We'll handle this with a separate state in useSocket
      setLatestPlanMarkdown(markdown);
    });

    socket.on(
      "annotation_added",
      ({ annotation }: { annotation: Annotation }) => {
        console.log("Client received annotation_added:", annotation);
        setLatestAnnotations((prev) => {
          // Deduplicate?
          if (prev.find((a) => a.id === annotation.id)) {
            console.log("Duplicate annotation, skipping:", annotation.id);
            return prev;
          }
          console.log("Adding new annotation to state:", annotation.id);
          return [...prev, annotation];
        });
        // Also update sessionState for consistency
        setSessionState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            annotations: [...(prev.annotations || []), annotation],
          };
        });
      }
    );

    socket.on("annotation_deleted", ({ annotationId }: { annotationId: string }) => {
      setLatestAnnotations((prev) => prev.filter((a) => a.id !== annotationId));
      setSessionState((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          annotations: (prev.annotations || []).filter((a) => a.id !== annotationId),
        };
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId, user.id]); // Re-run if sessionId or user identity changes

  const emitCursorMove = (x: number, y: number) => {
    if (!socketRef.current || !sessionId) return;
    socketRef.current.emit("cursor_move", {
      sessionId,
      userId: user.id,
      name: user.name,
      color: user.color,
      x,
      y,
    });
  };

  const addComment = (stepId: string | null, content: string) => {
    if (!socketRef.current || !sessionId) return;
    socketRef.current.emit("add_comment", {
      sessionId,
      stepId,
      content,
      user,
    });
  };

  const updatePlan = (markdown: string) => {
    if (!socketRef.current || !sessionId) return;
    socketRef.current.emit("update_plan", {
      sessionId,
      markdown,
      user,
    });
    // Optimistically update local state?
    // Actually, Editor updates its own state. We just emit.
    setLatestPlanMarkdown(markdown);
  };

  const addAnnotation = (annotation: Annotation) => {
    if (!socketRef.current || !sessionId) return;
    socketRef.current.emit("add_annotation", {
      sessionId,
      annotation,
    });
    // Optimistic update
    setLatestAnnotations((prev) => [...prev, annotation]);
    setSessionState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        annotations: [...(prev.annotations || []), annotation]
      };
    });
  };

  const deleteAnnotation = (annotationId: string) => {
    if (!socketRef.current || !sessionId) return;
    socketRef.current.emit("delete_annotation", {
      sessionId,
      annotationId,
    });
    // Optimistic update
    setLatestAnnotations((prev) => prev.filter((a) => a.id !== annotationId));
    setSessionState((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        annotations: (prev.annotations || []).filter((a) => a.id !== annotationId)
      };
    });
  };

  return {
    socket: socketRef.current,
    sessionState,
    cursors,
    isConnected,
    emitCursorMove,
    addComment,
    updatePlan,
    latestPlanMarkdown,
    latestAnnotations,
    addAnnotation,
    deleteAnnotation,
  };
};
