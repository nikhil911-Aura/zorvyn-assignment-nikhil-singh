import { dashboardController } from "../../../src/modules/dashboard/dashboard.controller.js";
import { requireAuth } from "../../../src/middleware/auth.js";

export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  return dashboardController.getSummary();
}
