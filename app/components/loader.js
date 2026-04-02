"use client";

export function Spinner({ size = "md", className = "" }) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-[3px]",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      className={`rounded-full border-accent/30 border-t-accent animate-spin ${sizeClasses[size]} ${className}`}
      style={{ animationDuration: "0.7s" }}
    />
  );
}

export function PageLoader({ message = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4 animate-fade-in">
      <Spinner size="lg" />
      <p className="text-text-muted text-sm">{message}</p>
    </div>
  );
}

export function FullScreenLoader() {
  return (
    <div className="fixed inset-0 bg-bg flex items-center justify-center z-50">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-accent/10" />
          <div
            className="absolute inset-0 h-16 w-16 rounded-full border-4 border-transparent border-t-accent animate-spin"
            style={{ animationDuration: "0.8s" }}
          />
        </div>
        <p className="text-text-muted text-sm font-medium tracking-wide">Loading...</p>
      </div>
    </div>
  );
}

export function TableLoader({ rows = 5, cols = 5 }) {
  return (
    <div className="border border-border rounded-xl overflow-hidden bg-bg-card">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            {Array.from({ length: cols }).map((_, i) => (
              <th key={i} className="px-5 py-4">
                <div className="skeleton h-3 w-20 rounded" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-b border-border last:border-0">
              {Array.from({ length: cols }).map((_, j) => (
                <td key={j} className="px-5 py-4">
                  <div className={`skeleton h-4 rounded ${j === 0 ? "w-24" : j === cols - 1 ? "w-16" : "w-20"}`} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatCardLoader() {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-6">
      <div className="skeleton h-3 w-24 rounded mb-3" />
      <div className="skeleton h-8 w-36 rounded" />
    </div>
  );
}

export function ButtonSpinner() {
  return (
    <Spinner size="sm" className="border-white/30 border-t-white" />
  );
}
