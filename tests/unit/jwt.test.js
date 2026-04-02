import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "../../src/lib/jwt.js";

describe("JWT Helpers", () => {
  it("signs and verifies a token", () => {
    const payload = { userId: "abc-123", role: "ADMIN" };
    const token = signToken(payload);
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe("abc-123");
    expect(decoded.role).toBe("ADMIN");
    expect(decoded.iat).toBeDefined();
    expect(decoded.exp).toBeDefined();
  });

  it("throws on invalid token", () => {
    expect(() => verifyToken("invalid-token")).toThrow();
  });

  it("throws on tampered token", () => {
    const token = signToken({ userId: "test" });
    const tampered = token.slice(0, -5) + "XXXXX";
    expect(() => verifyToken(tampered)).toThrow();
  });
});
