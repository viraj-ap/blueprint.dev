import { Routes, Route } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import SessionPage from "./components/SessionPage";
import { ThemeProvider } from "./components/theme-provider";
import MainLayout from "./components/layout/MainLayout";
import EditorView from "./views/EditorView";

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/session/:sessionId" element={<SessionPage />} />
        {/* New Editor Route using standard URL structure or replacing existing */}
        <Route
          path="/editor"
          element={
            <MainLayout>
              <EditorView />
            </MainLayout>
          }
        />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
