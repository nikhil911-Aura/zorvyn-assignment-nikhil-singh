"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import { FullScreenLoader } from "./loader";

export default function AuthGuard({ children, allowedRoles }) {
  const { user, loading, hasRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading) return <FullScreenLoader />;
  if (!user) return null;

  if (allowedRoles && !hasRole(allowedRoles)) {
    return (
      <div className="flex-1 ml-60 p-8">
        <div className="bg-danger-subtle border border-danger/20 rounded-xl p-6 text-danger text-sm animate-fade-in">
          You do not have permission to access this page.
        </div>
      </div>
    );
  }

  return children;
}
