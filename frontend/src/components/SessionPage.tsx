import { useParams } from "react-router-dom";
import { useSocket } from "../hooks/useSocket";
import { useUserIdentity } from "../hooks/useUserIdentity";
import MainLayout from "./layout/MainLayout";
import EditorView from "../views/EditorView";
import { JoinDialog } from "./session/JoinDialog";

export default function SessionPage() {
  const { sessionId } = useParams();
  const { identity, hasName, updateName } = useUserIdentity();

  const {
    sessionState,
    updatePlan,
    latestPlanMarkdown,
    addAnnotation,
    latestAnnotations,
    deleteAnnotation,
    cursors,
    emitCursorMove,
  } = useSocket(
    sessionId,
    identity
      ? {
          name: identity.name || "Anonymous",
          id: identity.id,
          color: identity.color,
        }
      : { name: "Anonymous", id: "loading", color: "#ccc" },
  );

  return (
    <div className="h-screen w-full">
      <MainLayout
        annotations={latestAnnotations}
        onAddAnnotation={addAnnotation}
        onDeleteAnnotation={deleteAnnotation}
        currentUser={
          identity ? { userId: identity.id, name: identity.name } : undefined
        }
        markdown={latestPlanMarkdown || sessionState?.content || ""}
        onShare={() => {
          navigator.clipboard.writeText(window.location.href);
        }}
        cursors={cursors}
        onMouseMove={(e: React.MouseEvent) => {
          if (emitCursorMove) emitCursorMove(e.clientX, e.clientY);
        }}
        onUpdateMarkdown={updatePlan}
        sessionId={sessionId}
      >
        <EditorView
          markdown={latestPlanMarkdown || sessionState?.content || ""}
          readOnly={!hasName}
          onUpdatePlan={updatePlan}
          onAddAnnotation={addAnnotation}
          annotations={latestAnnotations}
        />
      </MainLayout>

      <JoinDialog open={!hasName} onJoin={updateName} />
    </div>
  );
}
