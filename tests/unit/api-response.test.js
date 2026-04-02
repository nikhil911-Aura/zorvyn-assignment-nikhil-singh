import { describe, it, expect } from "vitest";
import {
  success,
  created,
  error,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
} from "../../src/utils/api-response.js";

describe("API Response Helpers", () => {
  it("success returns 200 with data", async () => {
    const res = success({ name: "test" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.name).toBe("test");
  });

  it("created returns 201", async () => {
    const res = created({ id: "123" });
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.id).toBe("123");
  });

  it("error returns 500 by default", async () => {
    const res = error("Something broke");
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.success).toBe(false);
    expect(body.error.message).toBe("Something broke");
    expect(body.error.status).toBe(500);
  });

  it("error includes details when provided", async () => {
    const details = [{ field: "email", message: "required" }];
    const res = error("Validation failed", 400, details);
    const body = await res.json();
    expect(body.error.details).toEqual(details);
  });

  it("badRequest returns 400", async () => {
    const res = badRequest("Invalid input");
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.message).toBe("Invalid input");
  });

  it("unauthorized returns 401", async () => {
    const res = unauthorized();
    expect(res.status).toBe(401);
    const body = await res.json();
    expect(body.error.message).toBe("Unauthorized");
  });

  it("forbidden returns 403", async () => {
    const res = forbidden("No access");
    expect(res.status).toBe(403);
    const body = await res.json();
    expect(body.error.message).toBe("No access");
  });

  it("notFound returns 404", async () => {
    const res = notFound("User not found");
    expect(res.status).toBe(404);
    const body = await res.json();
    expect(body.error.message).toBe("User not found");
  });
});
