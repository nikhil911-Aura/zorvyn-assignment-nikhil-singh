import { requireAuth } from "../../../../src/middleware/auth.js";
import { success } from "../../../../src/utils/api-response.js";

export async function GET(request) {
  const auth = await requireAuth(request);
  if (auth.error) return auth.error;
  return success(auth.user);
}
