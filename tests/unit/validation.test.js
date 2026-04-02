import { describe, it, expect } from "vitest";
import {
  loginSchema,
  createUserSchema,
  updateUserSchema,
  createRecordSchema,
  updateRecordSchema,
  recordFilterSchema,
  validate,
} from "../../src/utils/validation.js";

describe("Validation Schemas", () => {
  describe("loginSchema", () => {
    it("accepts valid credentials", () => {
      const result = validate(loginSchema, {
        email: "test@example.com",
        password: "password123",
      });
      expect(result.success).toBe(true);
      expect(result.data.email).toBe("test@example.com");
    });

    it("rejects invalid email", () => {
      const result = validate(loginSchema, {
        email: "not-an-email",
        password: "password123",
      });
      expect(result.success).toBe(false);
      expect(result.errors[0].field).toBe("email");
    });

    it("rejects short password", () => {
      const result = validate(loginSchema, {
        email: "test@example.com",
        password: "12345",
      });
      expect(result.success).toBe(false);
      expect(result.errors[0].field).toBe("password");
    });

    it("rejects missing fields", () => {
      const result = validate(loginSchema, {});
      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("createUserSchema", () => {
    it("accepts valid user data", () => {
      const result = validate(createUserSchema, {
        name: "John Doe",
        email: "john@example.com",
        password: "securepass",
        role: "ANALYST",
      });
      expect(result.success).toBe(true);
    });

    it("defaults role to undefined when omitted", () => {
      const result = validate(createUserSchema, {
        name: "John Doe",
        email: "john@example.com",
        password: "securepass",
      });
      expect(result.success).toBe(true);
      expect(result.data.role).toBeUndefined();
    });

    it("rejects invalid role", () => {
      const result = validate(createUserSchema, {
        name: "John",
        email: "john@example.com",
        password: "securepass",
        role: "SUPERADMIN",
      });
      expect(result.success).toBe(false);
    });

    it("rejects name shorter than 2 characters", () => {
      const result = validate(createUserSchema, {
        name: "J",
        email: "john@example.com",
        password: "securepass",
      });
      expect(result.success).toBe(false);
      expect(result.errors[0].field).toBe("name");
    });
  });

  describe("updateUserSchema", () => {
    it("accepts partial updates", () => {
      const result = validate(updateUserSchema, { role: "ADMIN" });
      expect(result.success).toBe(true);
    });

    it("accepts isActive boolean", () => {
      const result = validate(updateUserSchema, { isActive: false });
      expect(result.success).toBe(true);
      expect(result.data.isActive).toBe(false);
    });

    it("rejects invalid isActive type", () => {
      const result = validate(updateUserSchema, { isActive: "yes" });
      expect(result.success).toBe(false);
    });

    it("accepts empty object", () => {
      const result = validate(updateUserSchema, {});
      expect(result.success).toBe(true);
    });
  });

  describe("createRecordSchema", () => {
    it("accepts valid record data", () => {
      const result = validate(createRecordSchema, {
        amount: 1500.5,
        type: "INCOME",
        category: "Salary",
        date: "2025-03-01",
      });
      expect(result.success).toBe(true);
    });

    it("rejects negative amount", () => {
      const result = validate(createRecordSchema, {
        amount: -100,
        type: "EXPENSE",
        category: "Test",
        date: "2025-01-01",
      });
      expect(result.success).toBe(false);
      expect(result.errors[0].field).toBe("amount");
    });

    it("rejects zero amount", () => {
      const result = validate(createRecordSchema, {
        amount: 0,
        type: "INCOME",
        category: "Test",
        date: "2025-01-01",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid transaction type", () => {
      const result = validate(createRecordSchema, {
        amount: 100,
        type: "TRANSFER",
        category: "Test",
        date: "2025-01-01",
      });
      expect(result.success).toBe(false);
    });

    it("rejects invalid date format", () => {
      const result = validate(createRecordSchema, {
        amount: 100,
        type: "INCOME",
        category: "Test",
        date: "not-a-date",
      });
      expect(result.success).toBe(false);
    });

    it("rejects empty category", () => {
      const result = validate(createRecordSchema, {
        amount: 100,
        type: "INCOME",
        category: "",
        date: "2025-01-01",
      });
      expect(result.success).toBe(false);
    });

    it("accepts optional note", () => {
      const result = validate(createRecordSchema, {
        amount: 100,
        type: "INCOME",
        category: "Salary",
        date: "2025-01-01",
        note: "Monthly pay",
      });
      expect(result.success).toBe(true);
      expect(result.data.note).toBe("Monthly pay");
    });
  });

  describe("updateRecordSchema", () => {
    it("accepts partial updates", () => {
      const result = validate(updateRecordSchema, { amount: 200 });
      expect(result.success).toBe(true);
    });

    it("accepts empty object", () => {
      const result = validate(updateRecordSchema, {});
      expect(result.success).toBe(true);
    });
  });

  describe("recordFilterSchema", () => {
    it("applies defaults for page and limit", () => {
      const result = validate(recordFilterSchema, {});
      expect(result.success).toBe(true);
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    });

    it("coerces string numbers for pagination", () => {
      const result = validate(recordFilterSchema, { page: "3", limit: "50" });
      expect(result.success).toBe(true);
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    });

    it("rejects limit over 100", () => {
      const result = validate(recordFilterSchema, { limit: "200" });
      expect(result.success).toBe(false);
    });

    it("accepts valid filters", () => {
      const result = validate(recordFilterSchema, {
        type: "EXPENSE",
        category: "Rent",
        startDate: "2025-01-01",
        endDate: "2025-12-31",
        search: "payment",
      });
      expect(result.success).toBe(true);
    });
  });
});
