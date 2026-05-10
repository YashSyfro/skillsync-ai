export function Button({ children, onClick, disabled, loading, variant = "primary", type = "button", className = "" }) {
  const base = "inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-medium text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] shadow-sm";
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-gray-800",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    ghost: "text-gray-500 hover:text-gray-900 hover:bg-gray-100 shadow-none",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading} className={`${base} ${variants[variant]} ${className}`}>
      {loading ? (
        <span className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          Analyzing...
        </span>
      ) : children}
    </button>
  );
}

const BADGE_STYLES = {
  green:  "bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium",
  red:    "bg-red-50 text-red-600 border border-red-200 font-medium",
  amber:  "bg-amber-50 text-amber-700 border border-amber-200 font-medium",
  blue:   "bg-blue-50 text-blue-700 border border-blue-200 font-medium",
  gray:   "bg-gray-100 text-gray-600 border border-gray-200",
};

export function Badge({ label, color = "gray" }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs ${BADGE_STYLES[color]}`}>
      {label}
    </span>
  );
}

export function Card({ children, className = "" }) {
  return (
    <div className={`bg-white border border-gray-200 rounded-2xl shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function SectionLabel({ children }) {
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

export function SkeletonBlock({ className = "" }) {
  return <div className={`bg-gray-100 rounded-xl animate-pulse ${className}`} />;
}

export function AnalysisSkeleton() {
  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex gap-5 shadow-card">
        <SkeletonBlock className="w-20 h-20 rounded-2xl flex-shrink-0" />
        <div className="flex-1 space-y-2.5 py-1">
          <SkeletonBlock className="h-4 w-1/3" />
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-4/5" />
          <SkeletonBlock className="h-3 w-3/5" />
        </div>
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-card">
        <SkeletonBlock className="h-4 w-1/4" />
        <div className="flex gap-2 flex-wrap">
          {[...Array(7)].map((_, i) => <SkeletonBlock key={i} className="h-7 w-16 rounded-lg" />)}
        </div>
        <SkeletonBlock className="h-px w-full" />
        <div className="flex gap-2 flex-wrap">
          {[...Array(5)].map((_, i) => <SkeletonBlock key={i} className="h-7 w-20 rounded-lg" />)}
        </div>
      </div>
    </div>
  );
}