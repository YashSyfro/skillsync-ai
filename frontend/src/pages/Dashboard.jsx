import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RoadmapSection from "../components/roadmap/RoadmapSection";
import { Badge, SectionLabel } from "../components/ui/index.jsx";
import { useAnalysis } from "../context/AnalysisContext";

function ScoreRing({ score }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const filled = (score / 100) * circumference;
  const color = score >= 70 ? "#059669" : score >= 40 ? "#d97706" : "#dc2626";

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg width="96" height="96" viewBox="0 0 96 96" className="-rotate-90">
        <circle cx="48" cy="48" r={radius} fill="none" stroke="#f3f4f6" strokeWidth="7" />
        <circle
          cx="48" cy="48" r={radius}
          fill="none" stroke={color} strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${filled} ${circumference}`}
          style={{ transition: "stroke-dasharray 1s ease" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-xl font-bold" style={{ color }}>{score}%</span>
      </div>
    </div>
  );
}

function TabBar({ tabs, active, onChange }) {
  return (
    <div className="flex bg-gray-100 rounded-2xl p-1 gap-1">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`flex-1 py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-200 ${
            active === tab.id
              ? "bg-white text-gray-900 shadow-card"
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { result, resumeData, reset } = useAnalysis();
  const [activeTab, setActiveTab] = useState("analysis");

  useEffect(() => {
    if (!result) navigate("/analyze");
  }, [result, navigate]);

  if (!result) return null;

  const tabs = [
    { id: "analysis", label: "Skill Analysis" },
    { id: "roadmap", label: result.roadmap ? "Roadmap ✦" : "Roadmap" },
    { id: "raw", label: "All Skills" },
  ];

  const scoreBorderColor = result.match_score >= 70 ? "border-t-emerald-400" : result.match_score >= 40 ? "border-t-amber-400" : "border-t-red-400";
  const scoreLabel = result.match_score >= 70 ? "Strong match" : result.match_score >= 40 ? "Partial match" : "Needs work";
  const scoreLabelColor = result.match_score >= 70 ? "text-emerald-600" : result.match_score >= 40 ? "text-amber-600" : "text-red-500";

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gray-900 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="font-semibold text-gray-900 text-sm">SkillSync AI</span>
          </div>
          <button
            onClick={() => { reset(); navigate("/analyze"); }}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
          >
            ← New analysis
          </button>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">

        {/* Score card */}
        <div className={`bg-white border border-gray-200 border-t-4 ${scoreBorderColor} rounded-2xl shadow-card overflow-hidden`}>
          <div className="p-5 flex items-start gap-5">
            <ScoreRing score={result.match_score} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-semibold text-gray-900 text-sm truncate">{resumeData?.filename ?? "Resume"}</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 ${scoreLabelColor}`}>{scoreLabel}</span>
              </div>
              {result.job_title && (
                <p className="text-xs text-gray-400 font-mono mb-2">→ {result.job_title}</p>
              )}
              <p className="text-sm text-gray-500 leading-relaxed">{result.summary}</p>
            </div>
          </div>
          <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex gap-5">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-xs text-gray-600 font-medium">{result.matched_skills.length} matched</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-400" />
              <span className="text-xs text-gray-600 font-medium">{result.missing_skills.length} missing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-gray-300" />
              <span className="text-xs text-gray-500">{result.jd_skills.length} required total</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <TabBar tabs={tabs} active={activeTab} onChange={setActiveTab} />

        {/* Skill analysis */}
        {activeTab === "analysis" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-card divide-y divide-gray-100">
            <div className="p-5">
              <SectionLabel>✓ Matched ({result.matched_skills.length})</SectionLabel>
              {result.matched_skills.length === 0
                ? <p className="text-xs text-gray-400 italic">No overlapping skills found.</p>
                : <div className="flex flex-wrap gap-2">{result.matched_skills.map(s => <Badge key={s} label={s} color="green" />)}</div>
              }
            </div>
            <div className="p-5">
              <SectionLabel>✗ Missing ({result.missing_skills.length})</SectionLabel>
              {result.missing_skills.length === 0
                ? <p className="text-xs text-gray-400 italic">No missing skills — strong fit!</p>
                : <div className="flex flex-wrap gap-2">{result.missing_skills.map(s => <Badge key={s} label={s} color="red" />)}</div>
              }
            </div>
            {result.recommended_skills.length > 0 && (
              <div className="p-5 bg-amber-50/40">
                <SectionLabel>↑ Learn these first</SectionLabel>
                <div className="flex flex-wrap gap-2">
                  {result.recommended_skills.map(s => <Badge key={s} label={s} color="amber" />)}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Roadmap */}
        {activeTab === "roadmap" && (
          result.roadmap
            ? <RoadmapSection roadmap={result.roadmap} />
            : (
              <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-10 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl">🗺️</div>
                <p className="text-sm font-medium text-gray-700 mb-1">No roadmap generated</p>
                <p className="text-xs text-gray-400">Either no missing skills or the AI couldn't build one for this JD.</p>
              </div>
            )
        )}

        {/* All skills */}
        {activeTab === "raw" && (
          <div className="bg-white border border-gray-200 rounded-2xl shadow-card divide-y divide-gray-100">
            <div className="p-5">
              <SectionLabel>From your resume</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {result.resume_skills.map(s => <Badge key={s} label={s} color="blue" />)}
              </div>
            </div>
            <div className="p-5">
              <SectionLabel>From job description</SectionLabel>
              <div className="flex flex-wrap gap-1.5">
                {result.jd_skills.map(s => <Badge key={s} label={s} color="gray" />)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}