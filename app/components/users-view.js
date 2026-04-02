"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api-client";
import { TableLoader, ButtonSpinner } from "./loader";

const ROLE_BADGE = {
  ADMIN: "bg-accent-subtle text-accent",
  ANALYST: "bg-warning-subtle text-warning",
  VIEWER: "bg-bg-input text-text-muted",
};

export default function UsersView() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (search) params.set("search", search);
      const data = await api.get(`/users?${params}`);
      setUsers(data.users);
      setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDeactivate = async (id) => {
    if (!confirm("Deactivate this user?")) return;
    try {
      await api.delete(`/users/${id}`);
      fetchUsers(pagination.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleReactivate = async (id) => {
    try {
      await api.put(`/users/${id}`, { isActive: true });
      fetchUsers(pagination.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (formData) => {
    if (editUser) {
      const { password, ...updateData } = formData;
      await api.put(`/users/${editUser.id}`, updateData);
    } else {
      await api.post("/users", formData);
    }
    setShowModal(false);
    setEditUser(null);
    fetchUsers(pagination.page);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">User Management</h1>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="relative flex-1 sm:flex-none">
            <svg className="w-4 h-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              className="w-full sm:w-56 pl-9 pr-3 py-2 bg-bg-input border border-border rounded-xl text-sm text-text-primary outline-none transition-colors focus:border-accent placeholder:text-text-muted/50"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => { setEditUser(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span className="hidden sm:inline">New User</span>
            <span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-danger-subtle border border-danger/20 rounded-xl px-4 py-3 text-danger text-sm mb-5 animate-fade-in">
          {error}
          <button onClick={() => setError("")} className="float-right text-danger/60 hover:text-danger cursor-pointer bg-transparent border-none text-lg leading-none">&times;</button>
        </div>
      )}

      {loading ? (
        <TableLoader rows={6} cols={6} />
      ) : (
        <>
          <div className="border border-border rounded-xl overflow-hidden bg-bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">User</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider hidden sm:table-cell">Email</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Role</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Status</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Created</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-text-muted uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-16 text-center text-text-muted">
                        <svg className="w-10 h-10 mx-auto mb-3 text-text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        No users found
                      </td>
                    </tr>
                  ) : (
                    users.map((u) => (
                      <tr key={u.id} className="border-b border-border last:border-0 hover:bg-bg-card-hover transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold shrink-0">
                              {u.name.charAt(0)}
                            </div>
                            <span className="font-medium">{u.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-text-muted hidden sm:table-cell">{u.email}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${ROLE_BADGE[u.role]}`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`h-2 w-2 rounded-full ${u.isActive ? "bg-success" : "bg-danger"}`} />
                            <span className={`text-xs font-medium ${u.isActive ? "text-success" : "text-danger"}`}>
                              {u.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-text-muted whitespace-nowrap hidden md:table-cell">{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              onClick={() => { setEditUser(u); setShowModal(true); }}
                              className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent-subtle transition-colors cursor-pointer bg-transparent border-none"
                              title="Edit"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            {u.isActive ? (
                              <button
                                onClick={() => handleDeactivate(u.id)}
                                className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger-subtle transition-colors cursor-pointer bg-transparent border-none"
                                title="Deactivate"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                                </svg>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivate(u.id)}
                                className="p-1.5 rounded-lg text-text-muted hover:text-success hover:bg-success-subtle transition-colors cursor-pointer bg-transparent border-none"
                                title="Reactivate"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between mt-4 px-1 gap-2">
            <p className="text-xs text-text-muted">
              {pagination.total} user{pagination.total !== 1 ? "s" : ""} total
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchUsers(pagination.page - 1)}
                className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-text-muted hover:bg-bg-input hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-transparent"
              >
                Previous
              </button>
              <span className="text-xs text-text-muted tabular-nums">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchUsers(pagination.page + 1)}
                className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-text-muted hover:bg-bg-input hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-transparent"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      {showModal && (
        <UserModal
          user={editUser}
          onClose={() => { setShowModal(false); setEditUser(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function UserModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name: user?.name || "",
    email: user?.email || "",
    password: "",
    role: user?.role || "VIEWER",
    isActive: user?.isActive ?? true,
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary outline-none transition-colors focus:border-accent placeholder:text-text-muted/50";

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 animate-fade-in-overlay" onClick={onClose}>
      <div className="bg-bg-card border border-border rounded-2xl p-5 sm:p-6 w-full max-w-lg animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-base sm:text-lg font-semibold mb-5">{user ? "Edit User" : "New User"}</h2>
        {error && (
          <div className="bg-danger-subtle border border-danger/20 rounded-xl px-4 py-3 text-danger text-sm mb-4 animate-fade-in">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Name</label>
            <input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Email</label>
            <input type="email" className={inputClass} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          {!user && (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Password</label>
              <input type="password" className={inputClass} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} minLength={6} required />
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-text-muted mb-1.5">Role</label>
            <select className={inputClass} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="VIEWER">Viewer</option>
              <option value="ANALYST">Analyst</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          {user && (
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Status</label>
              <select className={inputClass} value={form.isActive ? "true" : "false"} onChange={(e) => setForm({ ...form, isActive: e.target.value === "true" })}>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-text-muted hover:bg-bg-input hover:text-text-primary transition-colors cursor-pointer bg-transparent">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer">
              {saving ? <><ButtonSpinner /> Saving...</> : user ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
