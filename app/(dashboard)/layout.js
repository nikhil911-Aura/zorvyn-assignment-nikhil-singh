"use client";

import { useState } from "react";
import AuthGuard from "../components/auth-guard";
import Sidebar from "../components/sidebar";
import MobileHeader from "../components/mobile-header";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AuthGuard>
      <div className="flex min-h-screen">
        {/* Mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-20 lg:hidden animate-fade-in-overlay"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:ml-60 min-w-0">
          <MobileHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </AuthGuard>
  );
}
