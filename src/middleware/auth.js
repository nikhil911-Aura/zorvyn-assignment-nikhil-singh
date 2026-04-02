import { verifyToken } from "../lib/jwt.js";
import { unauthorized, forbidden } from "../utils/api-response.js";
import prisma from "../lib/prisma.js";

export async function requireAuth(request) {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return { error: unauthorized("Missing or invalid authorization header") };
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });

    if (!user) {
      return { error: unauthorized("User not found") };
    }
    if (!user.isActive) {
      return { error: forbidden("Account is deactivated") };
    }

    return { user };
  } catch {
    return { error: unauthorized("Invalid or expired token") };
  }
}

export function requireRole(allowedRoles) {
  return async (request) => {
    const authResult = await requireAuth(request);
    if (authResult.error) return authResult;

    if (!allowedRoles.includes(authResult.user.role)) {
      return {
        error: forbidden(
          `Access denied. Required role: ${allowedRoles.join(" or ")}`
        ),
      };
    }

    return authResult;
  };
}
