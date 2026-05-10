import { Badge, Card, SectionLabel } from "../ui/index.jsx";
import { useState } from "react";

function ResourceChip({ resource }) {
  const icons = {
    docs: "📖",
    video: "▶",
    article: "✦",
  };

  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-400 transition-colors"
    >
      <span>{icons[resource.type] || "→"}</span>
      {resource.title}
    </a>
  );
}

function WeekNode({ week, index, total, isActive, onClick }) {
  const colors = [
    {
      ring: "border-blue-400",
      bg: "bg-blue-50",
      text: "text-blue-700",
    },
    {
      ring: "border-violet-400",
      bg: "bg-violet-50",
      text: "text-violet-700",
    },
    {
      ring: "border-emerald-400",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
    },
    {
      ring: "border-amber-400",
      bg: "bg-amber-50",
      text: "text-amber-700",
    },
    {
      ring: "border-rose-400",
      bg: "bg-rose-50",
      text: "text-rose-700",
    },
  ];

  const c = colors[index % colors.length];

  return (
    <button
      onClick={onClick}
      className="relative flex flex-col items-center gap-2 flex-1 min-w-0 transition-all duration-200"
    >
      {index < total - 1 && (
        <div className="absolute top-5 left-1/2 w-full h-0.5 bg-gray-200 z-0" />
      )}

      <div
        className={`relative z-10 w-11 h-11 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
          isActive
            ? `${c.ring} ${c.bg} shadow-lg scale-110`
            : "border-gray-200 bg-white hover:border-gray-300 hover:scale-105"
        }`}
      >
        <span
          className={`text-xs font-bold font-mono ${
            isActive ? c.text : "text-gray-400"
          }`}
        >
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="text-center px-1">
        <p
          className={`text-xs font-semibold leading-tight ${
            isActive ? "text-gray-900" : "text-gray-400"
          }`}
        >
          {week.week_label}
        </p>

        <p
          className={`text-xs mt-0.5 truncate max-w-[80px] ${
            isActive ? c.text : "text-gray-300"
          }`}
        >
          {week.focus_skills?.[0]}
        </p>
      </div>
    </button>
  );
}

function WeekDetail({ week, index }) {
  const colors = [
    {
      border: "border-l-blue-400",
      badge: "bg-blue-50 text-blue-700 border-blue-200",
      project: "bg-blue-50 border-blue-200 text-blue-800",
    },
    {
      border: "border-l-violet-400",
      badge: "bg-violet-50 text-violet-700 border-violet-200",
      project: "bg-violet-50 border-violet-200 text-violet-800",
    },
    {
      border: "border-l-emerald-400",
      badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
      project: "bg-emerald-50 border-emerald-200 text-emerald-800",
    },
  ];

  const c = colors[index % colors.length];

  return (
    <div
      className={`bg-white border border-gray-200 border-l-4 ${c.border} rounded-2xl p-5 shadow-sm`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">
            {week.week_label}
          </h3>

          <p className="text-xs text-gray-400 mt-1">
            {week.goal}
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {week.focus_skills?.map((skill) => (
            <span
              key={skill}
              className={`text-xs font-medium px-2 py-1 rounded-lg border ${c.badge}`}
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
          Tasks
        </p>

        <ul className="space-y-2">
          {week.tasks?.map((task, i) => (
            <li
              key={i}
              className="flex gap-2 text-xs text-gray-600"
            >
              <span className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400 font-mono text-[10px] mt-0.5">
                {i + 1}
              </span>

              {task}
            </li>
          ))}
        </ul>
      </div>

      {week.mini_project && (
        <div
          className={`rounded-xl border px-3 py-2.5 mb-4 ${c.project}`}
        >
          <p className="text-xs font-semibold mb-1">
            🛠 Mini Project
          </p>

          <p className="text-xs">
            {week.mini_project}
          </p>
        </div>
      )}

      {week.resources?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Resources
          </p>

          <div className="flex flex-wrap gap-2">
            {week.resources.map((resource, i) => (
              <ResourceChip key={i} resource={resource} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProjectCard({ project, index }) {
  const bgs = [
    "bg-blue-50 border-blue-200",
    "bg-violet-50 border-violet-200",
    "bg-emerald-50 border-emerald-200",
  ];

  const texts = [
    "text-blue-800",
    "text-violet-800",
    "text-emerald-800",
  ];

  return (
    <div
      className={`rounded-2xl border p-4 ${bgs[index % bgs.length]}`}
    >
      <p
        className={`font-semibold text-sm mb-1 ${
          texts[index % texts.length]
        }`}
      >
        {project.title}
      </p>

      <p className="text-xs text-gray-600 mb-3 leading-relaxed">
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {project.skills_used?.map((skill) => (
          <Badge key={skill} label={skill} color="gray" />
        ))}
      </div>
    </div>
  );
}

export default function RoadmapSection({ roadmap }) {
  const [activeWeek, setActiveWeek] = useState(0);

  if (!roadmap) return null;

  return (
    <div className="space-y-4">

      <Card className="p-5">
        <SectionLabel>Overview</SectionLabel>

        <p className="text-sm text-gray-600 leading-relaxed mb-4">
          {roadmap.summary}
        </p>

        {roadmap.priority_skills?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <span className="text-xs font-semibold text-gray-500">
              Start with:
            </span>

            {roadmap.priority_skills.map((skill) => (
              <Badge key={skill} label={skill} color="amber" />
            ))}
          </div>
        )}
      </Card>

      <Card className="p-5">
        <SectionLabel>Learning Path</SectionLabel>

        <div className="relative flex items-start gap-2 mb-6 overflow-x-auto pb-2">
          <div className="absolute top-5 left-6 right-6 h-0.5 bg-gray-100 z-0" />

          {roadmap.weeks?.map((week, i) => (
            <WeekNode
              key={i}
              week={week}
              index={i}
              total={roadmap.weeks.length}
              isActive={activeWeek === i}
              onClick={() => setActiveWeek(i)}
            />
          ))}
        </div>

        {roadmap.weeks?.[activeWeek] && (
          <WeekDetail
            week={roadmap.weeks[activeWeek]}
            index={activeWeek}
          />
        )}
      </Card>

      {roadmap.recommended_projects?.length > 0 && (
        <Card className="p-5">
          <SectionLabel>Portfolio Projects</SectionLabel>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {roadmap.recommended_projects.map((project, i) => (
              <ProjectCard
                key={i}
                project={project}
                index={i}
              />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}