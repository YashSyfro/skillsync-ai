import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AnalysisProvider } from "./context/AnalysisContext";
import Analyze from "./pages/Analyze";
import Dashboard from "./pages/Dashboard";

/**
 * AnalysisProvider wraps the router so all pages can access shared state.
 * Routes are kept flat — no nested layout components yet. Add them in Phase 2.
 */
export default function App() {
  return (
    <AnalysisProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/analyze" replace />} />
          <Route path="/analyze" element={<Analyze />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </BrowserRouter>
    </AnalysisProvider>
  );
}
