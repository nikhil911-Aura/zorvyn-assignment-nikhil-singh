import prisma from "../../lib/prisma.js";

const notDeleted = { isDeleted: false };

export const recordRepository = {
  async findAll({ where = {}, page = 1, limit = 20, orderBy = { date: "desc" } } = {}) {
    const skip = (page - 1) * limit;
    const fullWhere = { ...notDeleted, ...where };
    const [records, total] = await Promise.all([
      prisma.financialRecord.findMany({
        where: fullWhere,
        skip,
        take: limit,
        orderBy,
        include: {
          creator: {
            select: { id: true, name: true, email: true },
          },
        },
      }),
      prisma.financialRecord.count({ where: fullWhere }),
    ]);
    return { records, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findById(id) {
    return prisma.financialRecord.findFirst({
      where: { id, ...notDeleted },
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    });
  },

  async create(data) {
    return prisma.financialRecord.create({
      data,
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    });
  },

  async update(id, data) {
    return prisma.financialRecord.update({
      where: { id },
      data,
      include: {
        creator: { select: { id: true, name: true, email: true } },
      },
    });
  },

  async softDelete(id) {
    return prisma.financialRecord.update({
      where: { id },
      data: { isDeleted: true },
    });
  },

  async aggregate(where = {}) {
    const fullWhere = { ...notDeleted, ...where };
    const [income, expense] = await Promise.all([
      prisma.financialRecord.aggregate({
        where: { ...fullWhere, type: "INCOME" },
        _sum: { amount: true },
      }),
      prisma.financialRecord.aggregate({
        where: { ...fullWhere, type: "EXPENSE" },
        _sum: { amount: true },
      }),
    ]);
    return {
      totalIncome: income._sum.amount || 0,
      totalExpenses: expense._sum.amount || 0,
      netBalance: (income._sum.amount || 0) - (expense._sum.amount || 0),
    };
  },

  async categoryTotals(where = {}) {
    const results = await prisma.financialRecord.groupBy({
      by: ["category", "type"],
      where: { ...notDeleted, ...where },
      _sum: { amount: true },
      orderBy: { _sum: { amount: "desc" } },
    });
    return results.map((r) => ({
      category: r.category,
      type: r.type,
      total: r._sum.amount,
    }));
  },

  async monthlySummary(where = {}) {
    const records = await prisma.financialRecord.findMany({
      where: { ...notDeleted, ...where },
      select: { amount: true, type: true, date: true },
      orderBy: { date: "asc" },
    });

    const monthly = {};
    for (const record of records) {
      const key = `${record.date.getFullYear()}-${String(record.date.getMonth() + 1).padStart(2, "0")}`;
      if (!monthly[key]) {
        monthly[key] = { month: key, income: 0, expenses: 0 };
      }
      if (record.type === "INCOME") {
        monthly[key].income += record.amount;
      } else {
        monthly[key].expenses += record.amount;
      }
    }

    return Object.values(monthly).map((m) => ({
      ...m,
      net: m.income - m.expenses,
    }));
  },

  async weeklySummary(where = {}) {
    const records = await prisma.financialRecord.findMany({
      where: { ...notDeleted, ...where },
      select: { amount: true, type: true, date: true },
      orderBy: { date: "asc" },
    });

    const weekly = {};
    for (const record of records) {
      const d = new Date(record.date);
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay());
      const key = startOfWeek.toISOString().split("T")[0];
      if (!weekly[key]) {
        weekly[key] = { week: key, income: 0, expenses: 0 };
      }
      if (record.type === "INCOME") {
        weekly[key].income += record.amount;
      } else {
        weekly[key].expenses += record.amount;
      }
    }

    return Object.values(weekly).map((w) => ({
      ...w,
      net: w.income - w.expenses,
    }));
  },

  async recentTransactions(limit = 10) {
    return prisma.financialRecord.findMany({
      where: notDeleted,
      take: limit,
      orderBy: { date: "desc" },
      include: {
        creator: { select: { id: true, name: true } },
      },
    });
  },
};
