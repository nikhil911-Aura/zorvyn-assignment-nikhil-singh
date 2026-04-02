import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../../src/modules/financial-record/record.repository.js", () => ({
  recordRepository: {
    findAll: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    softDelete: vi.fn(),
  },
}));

import { recordService } from "../../src/modules/financial-record/record.service.js";
import { recordRepository } from "../../src/modules/financial-record/record.repository.js";

describe("RecordService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getRecordById", () => {
    it("returns record when found", async () => {
      const mockRecord = { id: "1", amount: 100, type: "INCOME" };
      recordRepository.findById.mockResolvedValue(mockRecord);

      const result = await recordService.getRecordById("1");
      expect(result).toEqual(mockRecord);
    });

    it("throws 404 when not found", async () => {
      recordRepository.findById.mockResolvedValue(null);

      await expect(recordService.getRecordById("999")).rejects.toEqual({
        status: 404,
        message: "Record not found",
      });
    });
  });

  describe("createRecord", () => {
    it("creates record with parsed date and userId", async () => {
      recordRepository.create.mockResolvedValue({ id: "1" });

      await recordService.createRecord(
        { amount: 500, type: "EXPENSE", category: "Rent", date: "2025-03-01" },
        "user-123"
      );

      expect(recordRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          amount: 500,
          type: "EXPENSE",
          category: "Rent",
          createdBy: "user-123",
          date: expect.any(Date),
        })
      );
    });
  });

  describe("updateRecord", () => {
    it("updates existing record", async () => {
      recordRepository.findById.mockResolvedValue({ id: "1" });
      recordRepository.update.mockResolvedValue({ id: "1", amount: 200 });

      const result = await recordService.updateRecord("1", { amount: 200 });
      expect(result.amount).toBe(200);
    });

    it("throws 404 if record does not exist", async () => {
      recordRepository.findById.mockResolvedValue(null);

      await expect(
        recordService.updateRecord("999", { amount: 200 })
      ).rejects.toEqual({ status: 404, message: "Record not found" });
    });

    it("converts date string to Date object", async () => {
      recordRepository.findById.mockResolvedValue({ id: "1" });
      recordRepository.update.mockResolvedValue({ id: "1" });

      await recordService.updateRecord("1", { date: "2025-06-15" });

      expect(recordRepository.update).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({ date: expect.any(Date) })
      );
    });
  });

  describe("deleteRecord", () => {
    it("soft deletes existing record", async () => {
      recordRepository.findById.mockResolvedValue({ id: "1" });
      recordRepository.softDelete.mockResolvedValue({});

      const result = await recordService.deleteRecord("1");
      expect(result.message).toBe("Record deleted successfully");
      expect(recordRepository.softDelete).toHaveBeenCalledWith("1");
    });

    it("throws 404 if record does not exist", async () => {
      recordRepository.findById.mockResolvedValue(null);

      await expect(recordService.deleteRecord("999")).rejects.toEqual({
        status: 404,
        message: "Record not found",
      });
    });
  });

  describe("listRecords", () => {
    it("builds where clause with type filter", async () => {
      recordRepository.findAll.mockResolvedValue({
        records: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      await recordService.listRecords({ type: "INCOME", page: 1, limit: 20 });

      expect(recordRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: "INCOME" }),
        })
      );
    });

    it("builds where clause with search filter", async () => {
      recordRepository.findAll.mockResolvedValue({
        records: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      await recordService.listRecords({ search: "salary" });

      expect(recordRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                category: { contains: "salary", mode: "insensitive" },
              }),
              expect.objectContaining({
                note: { contains: "salary", mode: "insensitive" },
              }),
            ]),
          }),
        })
      );
    });

    it("builds where clause with date range", async () => {
      recordRepository.findAll.mockResolvedValue({
        records: [],
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
      });

      await recordService.listRecords({
        startDate: "2025-01-01",
        endDate: "2025-12-31",
      });

      expect(recordRepository.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: {
              gte: expect.any(Date),
              lte: expect.any(Date),
            },
          }),
        })
      );
    });
  });
});
