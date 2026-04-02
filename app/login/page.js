"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/auth-context";
import LoginPage from "../components/login-page";
import { FullScreenLoader } from "../components/loader";

export default function Login() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace("/dashboard");
    }
  }, [user, loading, router]);

  if (loading) return <FullScreenLoader />;
  if (user) return null;

  return <LoginPage />;
}
