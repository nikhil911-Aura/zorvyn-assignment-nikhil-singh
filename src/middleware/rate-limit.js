const store = new Map();

const CLEANUP_INTERVAL = 60 * 1000; // 1 minute

// Periodically clean expired entries
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now > entry.resetTime) {
        store.delete(key);
      }
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Rate limiter for Next.js API routes.
 * @param {object} options
 * @param {number} options.windowMs - Time window in milliseconds (default: 60000)
 * @param {number} options.max - Max requests per window (default: 100)
 */
export function rateLimit({ windowMs = 60 * 1000, max = 100 } = {}) {
  return (request) => {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    const key = ip;
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now > entry.resetTime) {
      entry = { count: 0, resetTime: now + windowMs };
      store.set(key, entry);
    }

    entry.count++;

    const remaining = Math.max(0, max - entry.count);
    const headers = {
      "X-RateLimit-Limit": String(max),
      "X-RateLimit-Remaining": String(remaining),
      "X-RateLimit-Reset": String(Math.ceil(entry.resetTime / 1000)),
    };

    if (entry.count > max) {
      return {
        limited: true,
        response: Response.json(
          {
            success: false,
            error: {
              message: "Too many requests. Please try again later.",
              status: 429,
            },
          },
          { status: 429, headers }
        ),
      };
    }

    return { limited: false, headers };
  };
}

// Pre-configured limiters
export const apiLimiter = rateLimit({ windowMs: 60 * 1000, max: 100 });
export const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20 });
