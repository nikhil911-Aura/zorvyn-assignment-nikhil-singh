"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "../lib/api-client";
import { useAuth } from "../context/auth-context";
import { TableLoader, ButtonSpinner } from "./loader";
import Modal from "./modal";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatLocalDate(dateStr) {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function RecordsView() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole(["ADMIN"]);

  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [filters, setFilters] = useState({ type: "", category: "", startDate: "", endDate: "", search: "" });
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const fetchRecords = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "15" });
      if (filters.type) params.set("type", filters.type);
      if (filters.category) params.set("category", filters.category);
      if (filters.search) params.set("search", filters.search);
      if (filters.startDate) params.set("startDate", filters.startDate);
      if (filters.endDate) params.set("endDate", filters.endDate);

      const data = await api.get(`/records?${params}`);
      setRecords(data.records);
      setPagination({ page: data.page, totalPages: data.totalPages, total: data.total });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const handleDelete = async (id) => {
    if (!confirm("Delete this record?")) return;
    try {
      await api.delete(`/records/${id}`);
      setSuccessMsg("Record deleted successfully");
      setTimeout(() => setSuccessMsg(""), 3000);
      fetchRecords(pagination.page);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSave = async (formData) => {
    const isEdit = !!editRecord;
    if (isEdit) {
      await api.put(`/records/${editRecord.id}`, formData);
    } else {
      await api.post("/records", formData);
    }
    setShowModal(false);
    setEditRecord(null);
    setSuccessMsg(isEdit ? "Record updated successfully" : "Record added successfully");
    setTimeout(() => setSuccessMsg(""), 3000);
    fetchRecords(pagination.page);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Financial Records</h1>
        {isAdmin && (
          <button
            onClick={() => { setEditRecord(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-colors cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New Record
          </button>
        )}
      </div>

      {error && (
        <div className="bg-danger-subtle border border-danger/20 rounded-xl px-4 py-3 text-danger text-sm mb-5 animate-fade-in">
          {error}
          <button onClick={() => setError("")} className="float-right text-danger/60 hover:text-danger cursor-pointer bg-transparent border-none text-lg leading-none">&times;</button>
        </div>
      )}

      {successMsg && (
        <div className="bg-success-subtle border border-success/20 rounded-xl px-4 py-3 text-success text-sm mb-5 animate-fade-in">
          <span className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {successMsg}
          </span>
        </div>
      )}

      {/* Filters */}
      <div className="bg-bg-card border border-border rounded-xl p-3 sm:p-4 mb-5">
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2 sm:gap-3 items-end">
          <div className="col-span-2 sm:flex-1 sm:min-w-[180px]">
            <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Search</label>
            <input
              className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-sm text-text-primary outline-none transition-colors focus:border-accent placeholder:text-text-muted/50"
              placeholder="Search notes & categories..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            />
          </div>
          <div className="min-w-[120px]">
            <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Type</label>
            <select
              className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-sm text-text-primary outline-none transition-colors focus:border-accent"
              value={filters.type}
              onChange={(e) => setFilters({ ...filters, type: e.target.value })}
            >
              <option value="">All</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
          <div className="min-w-[150px]">
            <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">Category</label>
            <input
              className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-sm text-text-primary outline-none transition-colors focus:border-accent placeholder:text-text-muted/50"
              placeholder="Filter..."
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            />
          </div>
          <div className="min-w-[140px]">
            <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">From</label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-sm text-text-primary outline-none transition-colors focus:border-accent"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            />
          </div>
          <div className="min-w-[140px]">
            <label className="block text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">To</label>
            <input
              type="date"
              className="w-full px-3 py-2 bg-bg-input border border-border rounded-lg text-sm text-text-primary outline-none transition-colors focus:border-accent"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            />
          </div>
          <button
            onClick={() => setFilters({ type: "", category: "", startDate: "", endDate: "", search: "" })}
            className="px-3 py-2 border border-border rounded-lg text-xs font-medium text-text-muted hover:bg-bg-input hover:text-text-primary transition-colors cursor-pointer bg-transparent"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <TableLoader rows={8} cols={isAdmin ? 7 : 6} />
      ) : (
        <>
          <div className="border border-border rounded-xl overflow-hidden bg-bg-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Category</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-text-muted uppercase tracking-wider">Amount</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider hidden md:table-cell">Note</th>
                    <th className="px-5 py-3.5 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider hidden lg:table-cell">By</th>
                    {isAdmin && <th className="px-5 py-3.5 text-right text-[11px] font-semibold text-text-muted uppercase tracking-wider">Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={isAdmin ? 7 : 6} className="px-5 py-16 text-center text-text-muted">
                        <svg className="w-10 h-10 mx-auto mb-3 text-text-muted/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        No records found
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => (
                      <tr key={r.id} className="border-b border-border last:border-0 hover:bg-bg-card-hover transition-colors">
                        <td className="px-5 py-3.5 text-text-muted whitespace-nowrap">{new Date(r.date).toLocaleDateString()}</td>
                        <td className="px-5 py-3.5 font-medium">{r.category}</td>
                        <td className="px-5 py-3.5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
                            r.type === "INCOME" ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
                          }`}>
                            {r.type}
                          </span>
                        </td>
                        <td className={`px-5 py-3.5 text-right font-semibold tabular-nums ${r.type === "INCOME" ? "text-success" : "text-danger"}`}>
                          {formatCurrency(r.amount)}
                        </td>
                        <td className="px-5 py-3.5 text-text-muted max-w-[200px] truncate hidden md:table-cell">{r.note || "-"}</td>
                        <td className="px-5 py-3.5 text-text-muted hidden lg:table-cell">{r.creator?.name || "-"}</td>
                        {isAdmin && (
                          <td className="px-5 py-3.5 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => { setEditRecord(r); setShowModal(true); }}
                                className="p-1.5 rounded-lg text-text-muted hover:text-accent hover:bg-accent-subtle transition-colors cursor-pointer bg-transparent border-none"
                                title="Edit"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(r.id)}
                                className="p-1.5 rounded-lg text-text-muted hover:text-danger hover:bg-danger-subtle transition-colors cursor-pointer bg-transparent border-none"
                                title="Delete"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        )}
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
              {pagination.total} record{pagination.total !== 1 ? "s" : ""} total
            </p>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchRecords(pagination.page - 1)}
                className="px-3 py-1.5 border border-border rounded-lg text-xs font-medium text-text-muted hover:bg-bg-input hover:text-text-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer bg-transparent"
              >
                Previous
              </button>
              <span className="text-xs text-text-muted tabular-nums">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchRecords(pagination.page + 1)}
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
        <RecordModal
          record={editRecord}
          onClose={() => { setShowModal(false); setEditRecord(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function RecordModal({ record, onClose, onSave }) {
  const [form, setForm] = useState({
    amount: record?.amount || "",
    type: record?.type || "EXPENSE",
    category: record?.category || "",
    date: record ? formatLocalDate(record.date) : formatLocalDate(new Date()),
    note: record?.note || "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      await onSave({ ...form, amount: parseFloat(form.amount) });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full px-4 py-2.5 bg-bg-input border border-border rounded-xl text-sm text-text-primary outline-none transition-colors focus:border-accent focus:ring-1 focus:ring-accent/30 placeholder:text-text-muted/50";
  const selectClass = inputClass + " appearance-none cursor-pointer bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20width%3D%2216%22%20height%3D%2216%22%20fill%3D%22%2364748b%22%20viewBox%3D%220%200%2016%2016%22%3E%3Cpath%20d%3D%22M4.646%206.646a.5.5%200%2001.708%200L8%209.293l2.646-2.647a.5.5%200%2001.708.708l-3%203a.5.5%200%2001-.708%200l-3-3a.5.5%200%20010-.708z%22/%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center]";

  return (
    <Modal onClose={onClose}>
      <div className="bg-bg-card border border-border rounded-2xl w-full max-w-md animate-slide-up" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-base font-semibold">{record ? "Edit Record" : "New Record"}</h2>
            <p className="text-xs text-text-muted mt-0.5">{record ? "Update transaction details" : "Add a new transaction"}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-input transition-colors cursor-pointer bg-transparent border-none">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          {error && (
            <div className="bg-danger-subtle border border-danger/20 rounded-xl px-4 py-3 text-danger text-sm mb-4 animate-fade-in">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Amount</label>
                <input type="number" step="0.01" className={inputClass} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0.00" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Type</label>
                <select className={selectClass} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Category</label>
                <input className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} placeholder="e.g., Salary, Rent" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-text-muted mb-1.5">Date</label>
                <input type="date" className={inputClass} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-muted mb-1.5">Note (optional)</label>
              <input className={inputClass} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} placeholder="Add a note..." />
            </div>

            {/* Footer */}
            <div className="flex justify-end gap-2 pt-4 border-t border-border">
              <button type="button" onClick={onClose} className="px-4 py-2.5 border border-border rounded-xl text-sm font-medium text-text-muted hover:bg-bg-input hover:text-text-primary transition-colors cursor-pointer bg-transparent">
                Cancel
              </button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 bg-accent hover:bg-accent-hover text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60 cursor-pointer">
                {saving ? <span className="flex items-center gap-2"><ButtonSpinner /> Saving...</span> : record ? "Update" : "Create"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
