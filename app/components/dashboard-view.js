"use client";

import { useState, useEffect } from "react";
import { api } from "../lib/api-client";
import { StatCardLoader, TableLoader } from "./loader";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function DashboardSkeleton() {
  return (
    <div className="animate-fade-in">
      <div className="skeleton h-8 w-40 rounded-lg mb-6" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCardLoader />
        <StatCardLoader />
        <StatCardLoader />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <div className="skeleton h-5 w-44 rounded mb-5" />
          <TableLoader rows={4} cols={3} />
        </div>
        <div className="bg-bg-card border border-border rounded-xl p-6">
          <div className="skeleton h-5 w-40 rounded mb-5" />
          <TableLoader rows={4} cols={4} />
        </div>
      </div>
    </div>
  );
}

export default function DashboardView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/dashboard")
      .then(setData)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) {
    return (
      <div className="bg-danger-subtle border border-danger/20 rounded-xl px-5 py-4 text-danger text-sm animate-fade-in">
        {error}
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold tracking-tight mb-6">Dashboard</h1>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <StatCard
          label="Total Income"
          value={formatCurrency(data.totalIncome)}
          color="text-success"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 11l5-5m0 0l5 5m-5-5v12" />
            </svg>
          }
          bgColor="bg-success-subtle"
          iconColor="text-success"
        />
        <StatCard
          label="Total Expenses"
          value={formatCurrency(data.totalExpenses)}
          color="text-danger"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 13l-5 5m0 0l-5-5m5 5V6" />
            </svg>
          }
          bgColor="bg-danger-subtle"
          iconColor="text-danger"
        />
        <StatCard
          label="Net Balance"
          value={formatCurrency(data.netBalance)}
          color={data.netBalance >= 0 ? "text-success" : "text-danger"}
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          bgColor={data.netBalance >= 0 ? "bg-success-subtle" : "bg-danger-subtle"}
          iconColor={data.netBalance >= 0 ? "text-success" : "text-danger"}
        />
      </div>

      {/* Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Category Breakdown */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold">Category Breakdown</h3>
          </div>
          {data.categoryTotals.length === 0 ? (
            <EmptyState message="No category data" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Category</th>
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Type</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-text-muted uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.categoryTotals.map((ct, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-bg-card-hover transition-colors">
                      <td className="px-5 py-3 font-medium">{ct.category}</td>
                      <td className="px-5 py-3">
                        <Badge type={ct.type} />
                      </td>
                      <td className="px-5 py-3 text-right font-medium tabular-nums">{formatCurrency(ct.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Monthly Summary */}
        <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h3 className="text-sm font-semibold">Monthly Summary</h3>
          </div>
          {data.monthlySummary.length === 0 ? (
            <EmptyState message="No monthly data" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-5 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Month</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-text-muted uppercase tracking-wider">Income</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-text-muted uppercase tracking-wider">Expenses</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold text-text-muted uppercase tracking-wider">Net</th>
                  </tr>
                </thead>
                <tbody>
                  {data.monthlySummary.map((m) => (
                    <tr key={m.month} className="border-b border-border last:border-0 hover:bg-bg-card-hover transition-colors">
                      <td className="px-5 py-3 font-medium">{m.month}</td>
                      <td className="px-5 py-3 text-right text-success tabular-nums">{formatCurrency(m.income)}</td>
                      <td className="px-5 py-3 text-right text-danger tabular-nums">{formatCurrency(m.expenses)}</td>
                      <td className={`px-5 py-3 text-right font-semibold tabular-nums ${m.net >= 0 ? "text-success" : "text-danger"}`}>
                        {formatCurrency(m.net)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="text-sm font-semibold">Recent Transactions</h3>
        </div>
        {data.recentTransactions.length === 0 ? (
          <EmptyState message="No transactions yet" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Date</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-text-muted uppercase tracking-wider">Amount</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">Note</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-text-muted uppercase tracking-wider">By</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTransactions.map((t) => (
                  <tr key={t.id} className="border-b border-border last:border-0 hover:bg-bg-card-hover transition-colors">
                    <td className="px-5 py-3 text-text-muted">{new Date(t.date).toLocaleDateString()}</td>
                    <td className="px-5 py-3 font-medium">{t.category}</td>
                    <td className="px-5 py-3"><Badge type={t.type} /></td>
                    <td className={`px-5 py-3 text-right font-semibold tabular-nums ${t.type === "INCOME" ? "text-success" : "text-danger"}`}>
                      {formatCurrency(t.amount)}
                    </td>
                    <td className="px-5 py-3 text-text-muted max-w-[200px] truncate">{t.note || "-"}</td>
                    <td className="px-5 py-3 text-text-muted">{t.creator?.name || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, color, icon, bgColor, iconColor }) {
  return (
    <div className="bg-bg-card border border-border rounded-xl p-4 sm:p-5 hover:border-border-hover transition-colors">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">{label}</span>
        <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-lg ${bgColor} flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
      </div>
      <div className={`text-xl sm:text-2xl font-bold tabular-nums ${color}`}>{value}</div>
    </div>
  );
}

function Badge({ type }) {
  const isIncome = type === "INCOME";
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${
      isIncome ? "bg-success-subtle text-success" : "bg-danger-subtle text-danger"
    }`}>
      {type}
    </span>
  );
}

function EmptyState({ message }) {
  return (
    <div className="py-10 text-center text-text-muted text-sm">{message}</div>
  );
}
