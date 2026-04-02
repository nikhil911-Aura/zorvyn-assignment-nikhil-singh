import { userService } from "./user.service.js";
import {
  success,
  created,
  badRequest,
  notFound,
  error,
} from "../../utils/api-response.js";
import {
  createUserSchema,
  updateUserSchema,
  validate,
} from "../../utils/validation.js";

export const userController = {
  async list(request) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const data = await userService.listUsers({ page, limit, search });
    return success(data);
  },

  async getById(id) {
    try {
      const user = await userService.getUserById(id);
      return success(user);
    } catch (err) {
      if (err.status === 404) return notFound(err.message);
      return error(err.message);
    }
  },

  async create(request) {
    const body = await request.json();
    const validation = validate(createUserSchema, body);
    if (!validation.success) {
      return badRequest("Validation failed", validation.errors);
    }

    try {
      const user = await userService.createUser(validation.data);
      return created(user);
    } catch (err) {
      if (err.status === 400) return badRequest(err.message);
      return error(err.message);
    }
  },

  async update(id, request) {
    const body = await request.json();
    const validation = validate(updateUserSchema, body);
    if (!validation.success) {
      return badRequest("Validation failed", validation.errors);
    }

    try {
      const user = await userService.updateUser(id, validation.data);
      return success(user);
    } catch (err) {
      if (err.status === 404) return notFound(err.message);
      if (err.status === 400) return badRequest(err.message);
      return error(err.message);
    }
  },

  async delete(id, currentUserId) {
    try {
      const result = await userService.deleteUser(id, currentUserId);
      return success(result);
    } catch (err) {
      if (err.status === 404) return notFound(err.message);
      if (err.status === 400) return badRequest(err.message);
      return error(err.message);
    }
  },
};
