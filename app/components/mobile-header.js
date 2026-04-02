"use client";

import { useAuth } from "../context/auth-context";

export default function MobileHeader({ onMenuClick }) {
  const { user } = useAuth();

  return (
    <header className="lg:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-bg-card sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 rounded-lg text-text-muted hover:bg-bg-input hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-accent/10 flex items-center justify-center">
            <svg className="w-3.5 h-3.5 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="text-sm font-semibold">Finance</span>
        </div>
      </div>
      <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold">
        {user?.name?.charAt(0) || "?"}
      </div>
    </header>
  );
}
