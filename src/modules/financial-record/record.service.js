import { recordRepository } from "./record.repository.js";

export const recordService = {
  async listRecords(filters = {}) {
    const where = buildWhereClause(filters);
    return recordRepository.findAll({
      where,
      page: filters.page,
      limit: filters.limit,
    });
  },

  async getRecordById(id) {
    const record = await recordRepository.findById(id);
    if (!record) throw { status: 404, message: "Record not found" };
    return record;
  },

  async createRecord(data, userId) {
    return recordRepository.create({
      ...data,
      date: new Date(data.date),
      createdBy: userId,
    });
  },

  async updateRecord(id, data) {
    const record = await recordRepository.findById(id);
    if (!record) throw { status: 404, message: "Record not found" };

    const updateData = { ...data };
    if (data.date) updateData.date = new Date(data.date);

    return recordRepository.update(id, updateData);
  },

  async deleteRecord(id) {
    const record = await recordRepository.findById(id);
    if (!record) throw { status: 404, message: "Record not found" };
    await recordRepository.softDelete(id);
    return { message: "Record deleted successfully" };
  },
};

function buildWhereClause(filters) {
  const where = {};
  if (filters.type) where.type = filters.type;
  if (filters.category)
    where.category = { contains: filters.category, mode: "insensitive" };
  if (filters.search) {
    where.OR = [
      { category: { contains: filters.search, mode: "insensitive" } },
      { note: { contains: filters.search, mode: "insensitive" } },
    ];
  }
  if (filters.startDate || filters.endDate) {
    where.date = {};
    if (filters.startDate) where.date.gte = new Date(filters.startDate);
    if (filters.endDate) where.date.lte = new Date(filters.endDate);
  }
  return where;
}
