import { userController } from "../../../src/modules/user/user.controller.js";
import { requireRole } from "../../../src/middleware/auth.js";

export async function GET(request) {
  const auth = await requireRole(["ADMIN", "ANALYST"])(request);
  if (auth.error) return auth.error;
  return userController.list(request);
}

export async function POST(request) {
  const auth = await requireRole(["ADMIN"])(request);
  if (auth.error) return auth.error;
  return userController.create(request);
}
