import { recordController } from "../../../../src/modules/financial-record/record.controller.js";
import { requireAuth, requireRole } from "../../../../src/middleware/auth.js";

export async function GET(request, { params }) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  const { id } = await params;
  return recordController.getById(id);
}

export async function PUT(request, { params }) {
  const auth = await requireRole(["ADMIN"])(request);
  if (auth.error) return auth.error;
  const { id } = await params;
  return recordController.update(id, request);
}

export async function DELETE(request, { params }) {
  const auth = await requireRole(["ADMIN"])(request);
  if (auth.error) return auth.error;
  const { id } = await params;
  return recordController.delete(id);
}
