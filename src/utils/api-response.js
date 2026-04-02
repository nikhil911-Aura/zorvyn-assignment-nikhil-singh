export function success(data, status = 200) {
  return Response.json({ success: true, data }, { status });
}

export function created(data) {
  return success(data, 201);
}

export function error(message, status = 500, errors = null) {
  const body = { success: false, error: { message, status } };
  if (errors) body.error.details = errors;
  return Response.json(body, { status });
}

export function badRequest(message = "Bad request", errors = null) {
  return error(message, 400, errors);
}

export function unauthorized(message = "Unauthorized") {
  return error(message, 401);
}

export function forbidden(message = "Forbidden") {
  return error(message, 403);
}

export function notFound(message = "Not found") {
  return error(message, 404);
}
