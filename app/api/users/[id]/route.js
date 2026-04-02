import { userController } from "../../../../src/modules/user/user.controller.js";
import { requireRole } from "../../../../src/middleware/auth.js";

export async function GET(request, { params }) {
  const auth = await requireRole(["ADMIN"])(request);
  if (auth.error) return auth.error;
  const { id } = await params;
  return userController.getById(id);
}

export async function PUT(request, { params }) {
  const auth = await requireRole(["ADMIN"])(request);
  if (auth.error) return auth.error;
  const { id } = await params;
  return userController.update(id, request);
}

export async function DELETE(request, { params }) {
  const auth = await requireRole(["ADMIN"])(request);
  if (auth.error) return auth.error;
  const { id } = await params;
  return userController.delete(id, auth.user.id);
}
