"use client";

import AuthGuard from "../../components/auth-guard";
import UsersView from "../../components/users-view";

export default function UsersPage() {
  return (
    <AuthGuard allowedRoles={["ADMIN"]}>
      <UsersView />
    </AuthGuard>
  );
}
