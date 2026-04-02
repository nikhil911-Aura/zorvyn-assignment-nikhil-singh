import prisma from "../../lib/prisma.js";

const userSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
};

export const userRepository = {
  async findAll({ page = 1, limit = 20, search = "" } = {}) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: userSelect,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);
    return { users, total, page, limit, totalPages: Math.ceil(total / limit) };
  },

  async findById(id) {
    return prisma.user.findUnique({ where: { id }, select: userSelect });
  },

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  async create(data) {
    return prisma.user.create({ data, select: userSelect });
  },

  async update(id, data) {
    return prisma.user.update({ where: { id }, data, select: userSelect });
  },

  async delete(id) {
    return prisma.user.delete({ where: { id } });
  },

  async countByRole(role) {
    return prisma.user.count({ where: { role, isActive: true } });
  },
};
