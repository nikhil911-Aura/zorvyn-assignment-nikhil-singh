import { authController } from "../../../../src/modules/auth/auth.controller.js";
import { authLimiter } from "../../../../src/middleware/rate-limit.js";

export async function POST(request) {
  const limit = authLimiter(request);
  if (limit.limited) return limit.response;
  return authController.login(request);
}
