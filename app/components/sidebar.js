"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../context/auth-context";

const NAV_ITEMS = [
  {
    href: "/dashboard",
    label: "Dashboard",
    roles: ["VIEWER", "ANALYST", "ADMIN"],
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/records",
    label: "Records",
    roles: ["VIEWER", "ANALYST", "ADMIN"],
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
  {
    href: "/users",
    label: "Users",
    roles: ["ADMIN"],
    icon: (
      <svg className="w-[18px] h-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
  },
];

const ROLE_COLORS = {
  ADMIN: "bg-accent-subtle text-accent",
  ANALYST: "bg-warning-subtle text-warning",
  VIEWER: "bg-bg-input text-text-muted",
};

export default function Sidebar({ open, onClose }) {
  const { user, logout, hasRole } = useAuth();
  const pathname = usePathname();

  const visibleNav = NAV_ITEMS.filter((item) => hasRole(item.roles));

  return (
    <aside
      className={`
        w-60 bg-bg-card border-r border-border flex flex-col z-30
        fixed top-0 bottom-0 left-0
        transition-transform duration-200 ease-in-out
        lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}
    >
      {/* Brand + close button */}
      <div className="px-5 py-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
            <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <span className="text-[15px] font-semibold tracking-tight">Finance</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-text-muted hover:bg-bg-input hover:text-text-primary transition-colors cursor-pointer bg-transparent border-none"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-3 py-4">
        <p className="text-[10px] font-semibold text-text-muted/60 uppercase tracking-widest px-3 mb-2">Menu</p>
        {visibleNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-150 no-underline ${
                isActive
                  ? "bg-accent/10 text-accent"
                  : "text-text-muted hover:bg-bg-input hover:text-text-primary"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-9 w-9 rounded-full bg-accent/10 flex items-center justify-center text-accent text-sm font-bold shrink-0">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <span className={`inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${ROLE_COLORS[user.role]}`}>
              {user.role}
            </span>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-text-muted text-xs font-medium hover:bg-bg-input hover:text-text-primary transition-colors cursor-pointer bg-transparent"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
