import { recordController } from "../../../src/modules/financial-record/record.controller.js";
import { requireAuth, requireRole } from "../../../src/middleware/auth.js";

export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  return recordController.list(request);
}

export async function POST(request) {
  const auth = await requireRole(["ADMIN"])(request);
  if (auth.error) return auth.error;
  return recordController.create(request, auth.user.id);
}
