import { recordService } from "./record.service.js";
import {
  success,
  created,
  badRequest,
  notFound,
  error,
} from "../../utils/api-response.js";
import {
  createRecordSchema,
  updateRecordSchema,
  recordFilterSchema,
  validate,
} from "../../utils/validation.js";

export const recordController = {
  async list(request) {
    const { searchParams } = new URL(request.url);
    const filters = Object.fromEntries(searchParams.entries());
    const validation = validate(recordFilterSchema, filters);
    if (!validation.success) {
      return badRequest("Validation failed", validation.errors);
    }

    const data = await recordService.listRecords(validation.data);
    return success(data);
  },

  async getById(id) {
    try {
      const record = await recordService.getRecordById(id);
      return success(record);
    } catch (err) {
      if (err.status === 404) return notFound(err.message);
      return error(err.message);
    }
  },

  async create(request, userId) {
    const body = await request.json();
    const validation = validate(createRecordSchema, body);
    if (!validation.success) {
      return badRequest("Validation failed", validation.errors);
    }

    try {
      const record = await recordService.createRecord(validation.data, userId);
      return created(record);
    } catch (err) {
      return error(err.message);
    }
  },

  async update(id, request) {
    const body = await request.json();
    const validation = validate(updateRecordSchema, body);
    if (!validation.success) {
      return badRequest("Validation failed", validation.errors);
    }

    try {
      const record = await recordService.updateRecord(id, validation.data);
      return success(record);
    } catch (err) {
      if (err.status === 404) return notFound(err.message);
      return error(err.message);
    }
  },

  async delete(id) {
    try {
      const result = await recordService.deleteRecord(id);
      return success(result);
    } catch (err) {
      if (err.status === 404) return notFound(err.message);
      return error(err.message);
    }
  },
};
