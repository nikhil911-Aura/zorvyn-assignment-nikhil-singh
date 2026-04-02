import { authService } from "./auth.service.js";
import { success, badRequest, unauthorized, forbidden, error } from "../../utils/api-response.js";
import { loginSchema, validate } from "../../utils/validation.js";

export const authController = {
  async login(request) {
    const body = await request.json();
    const validation = validate(loginSchema, body);
    if (!validation.success) {
      return badRequest("Validation failed", validation.errors);
    }

    try {
      const result = await authService.login(validation.data.email, validation.data.password);
      return success(result);
    } catch (err) {
      if (err.status === 401) return unauthorized(err.message);
      if (err.status === 403) return forbidden(err.message);
      return error(err.message);
    }
  },
};
