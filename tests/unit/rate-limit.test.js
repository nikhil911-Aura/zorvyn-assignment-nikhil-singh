import { describe, it, expect } from "vitest";
import { rateLimit } from "../../src/middleware/rate-limit.js";

function mockRequest(ip = "127.0.0.1") {
  return {
    headers: new Map([["x-forwarded-for", ip]]),
  };
}

describe("Rate Limiter", () => {
  it("allows requests under the limit", () => {
    const limiter = rateLimit({ windowMs: 60000, max: 5 });
    const req = mockRequest("10.0.0.1");
    const result = limiter(req);
    expect(result.limited).toBe(false);
    expect(result.headers["X-RateLimit-Remaining"]).toBe("4");
  });

  it("blocks requests over the limit", () => {
    const limiter = rateLimit({ windowMs: 60000, max: 3 });
    const req = mockRequest("10.0.0.2");

    limiter(req);
    limiter(req);
    limiter(req);
    const result = limiter(req);

    expect(result.limited).toBe(true);
    expect(result.response.status).toBe(429);
  });

  it("tracks different IPs separately", () => {
    const limiter = rateLimit({ windowMs: 60000, max: 2 });

    const req1 = mockRequest("10.0.0.3");
    const req2 = mockRequest("10.0.0.4");

    limiter(req1);
    limiter(req1);
    const r1 = limiter(req1);
    const r2 = limiter(req2);

    expect(r1.limited).toBe(true);
    expect(r2.limited).toBe(false);
  });

  it("returns correct rate limit headers", () => {
    const limiter = rateLimit({ windowMs: 60000, max: 10 });
    const req = mockRequest("10.0.0.5");
    const result = limiter(req);

    expect(result.headers["X-RateLimit-Limit"]).toBe("10");
    expect(result.headers["X-RateLimit-Remaining"]).toBe("9");
    expect(result.headers["X-RateLimit-Reset"]).toBeDefined();
  });
});
