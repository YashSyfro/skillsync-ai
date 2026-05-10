import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import ResumeUploader from "../components/resume/ResumeUploader";
import { Button } from "../components/ui/index.jsx";
import { useAnalysis } from "../context/AnalysisContext";
import api from "../services/api";

const STEPS = [
  { label: "Reading resume", sub: "Extracting text from PDF" },
  { label: "Identifying skills", sub: "Scanning resume for technologies" },
  { label: "Parsing job description", sub: "Finding required skills" },
  { label: "Scoring match", sub: "Comparing your profile to the role" },
  { label: "Building roadmap", sub: "Generating your learning plan" },
];

function LoadingView() {
  const [stepIndex, setStepIndex] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 5000);
    return () => clearInterval(timerRef.current);
  }, []);

  const pct = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        {/* Progress bar */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500">Analyzing</span>
          <span className="text-xs font-mono text-gray-400">{pct}%</span>
        </div>
        <div className="h-1 bg-gray-100 rounded-full mb-6">
          <div
            className="h-full bg-gray-900 rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {STEPS.map((step, i) => {
            const done = i < stepIndex;
            const active = i === stepIndex;
            return (
              <div key={i} className={`flex items-center gap-3 transition-opacity duration-300 ${i > stepIndex ? "opacity-30" : "opacity-100"}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-medium transition-colors
                  ${done ? "bg-emerald-500 text-white" : active ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-400"}`}>
                  {done ? "✓" : i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${active ? "text-gray-900" : done ? "text-gray-400" : "text-gray-300"}`}>
                    {step.label}
                    {active && <span className="inline-block ml-1 animate-pulse">...</span>}
                  </p>
                  {active && <p className="text-xs text-gray-400 mt-0.5">{step.sub}</p>}
                </div>
                {active && (
                  <div className="w-4 h-4 border-2 border-gray-200 border-t-gray-700 rounded-full animate-spin flex-shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        <p className="text-xs text-gray-300 text-center mt-5 border-t border-gray-100 pt-4">
          Usually takes 20–30 seconds
        </p>
      </div>
    </div>
  );
}

export default function Analyze() {
  const navigate = useNavigate();
  const { setResult, setResumeData, isLoading, setIsLoading, error, setError } = useAnalysis();
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");

  const handleSubmit = async () => {
    if (!file) return setError("Please upload your resume PDF.");
    if (jobDescription.trim().length < 50)
      return setError("Job description is too short. Paste the full JD for best results.");

    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const uploadRes = await api.post("/api/resume/upload", formData);
      const { session_id, raw_text, filename, char_count } = uploadRes.data;
      setResumeData({ session_id, filename, char_count });

      const analysisRes = await api.post("/api/analysis/run", {
        session_id,
        resume_text: raw_text,
        job_description: jobDescription,
      }, { timeout: 90000 });

      setResult(analysisRes.data);
      navigate("/dashboard");
    } catch (err) {
      const detail = err.response?.data?.detail || "Request timed out. Please try again.";
      setError(detail);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">SkillSync AI</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className={`w-1.5 h-1.5 rounded-full transition-colors ${isLoading ? "bg-amber-400 animate-pulse" : "bg-emerald-500"}`} />
            <span className="text-xs text-gray-400">{isLoading ? "Analyzing" : "Ready"}</span>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {isLoading ? <LoadingView /> : (
          <div>
            <div className="mb-8">
              <h1 className="text-2xl font-semibold text-gray-900 mb-1.5">Analyze your resume</h1>
              <p className="text-sm text-gray-400">Upload your resume and paste a job description to get your skill gap analysis and learning roadmap.</p>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Resume (PDF)</label>
                <ResumeUploader onFileSelect={setFile} selectedFile={file} disabled={isLoading} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Job description</label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here — the more detail, the better the analysis."
                  rows={10}
                  className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400 resize-none transition-colors"
                />
                <p className="text-xs text-gray-300 mt-1">{jobDescription.length} characters</p>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 text-red-500 rounded-xl px-4 py-3 text-sm">
                  {error}
                </div>
              )}

              <Button onClick={handleSubmit} loading={isLoading}>
                Analyze Skills →
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}