import { createContext, useContext, useState } from "react";

/**
 * Why context and not local state?
 * The Analyze page uploads the file and triggers analysis.
 * The results page (Dashboard) needs the same data.
 * Without context, we'd have to pass data through URL params or
 * re-fetch on every render. Context solves this cleanly.
 *
 * Why not Redux or Zustand?
 * Overkill for Phase 1. Context is built into React and easy to
 * explain in interviews. Add Zustand in Phase 3 if state gets complex.
 */
const AnalysisContext = createContext(null);

export function AnalysisProvider({ children }) {
  // Stores the full response from POST /api/analysis/run
  const [result, setResult] = useState(null);
  // Stores the resume text after upload (needed for analysis request)
  const [resumeData, setResumeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const reset = () => {
    setResult(null);
    setResumeData(null);
    setError(null);
  };

  return (
    <AnalysisContext.Provider
      value={{ result, setResult, resumeData, setResumeData, isLoading, setIsLoading, error, setError, reset }}
    >
      {children}
    </AnalysisContext.Provider>
  );
}

// Custom hook so components never import useContext + AnalysisContext together
export function useAnalysis() {
  const ctx = useContext(AnalysisContext);
  if (!ctx) throw new Error("useAnalysis must be used inside <AnalysisProvider>");
  return ctx;
}
