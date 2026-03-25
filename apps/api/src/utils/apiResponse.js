export function sendSuccess(res, payload = {}, message = "Request successful", statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data: payload,
    meta: {
      requestId: res.req?.context?.requestId || null,
      timestamp: new Date().toISOString(),
    },
  });
}

export function sendError(res, message = "Request failed", statusCode = 500, details = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    details,
    meta: {
      requestId: res.req?.context?.requestId || null,
      timestamp: new Date().toISOString(),
    },
  });
}
