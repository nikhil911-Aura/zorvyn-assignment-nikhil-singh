import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const createUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["VIEWER", "ANALYST", "ADMIN"]).optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum(["VIEWER", "ANALYST", "ADMIN"]).optional(),
  isActive: z.boolean().optional(),
});

export const createRecordSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  type: z.enum(["INCOME", "EXPENSE"]),
  category: z.string().min(1, "Category is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date"),
  note: z.string().optional(),
});

export const updateRecordSchema = z.object({
  amount: z.number().positive().optional(),
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().min(1).optional(),
  date: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date")
    .optional(),
  note: z.string().optional(),
});

export const recordFilterSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]).optional(),
  category: z.string().optional(),
  search: z.string().optional(),
  startDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date")
    .optional(),
  endDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), "Invalid date")
    .optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const issues = result.error.issues || result.error.errors || [];
    const errors = issues.map((e) => ({
      field: (e.path || []).join("."),
      message: e.message,
    }));
    return { success: false, errors };
  }
  return { success: true, data: result.data };
}
