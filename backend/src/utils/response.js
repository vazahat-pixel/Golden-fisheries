/**
 * Standard JSON envelope helpers (ESM).
 * Prefer these for new code; ApiResponse internally aligns to the same shape.
 */
export function sendSuccess(res, data, message = 'Success', statusCode = 200, meta = null) {
  const body = { success: true, message, data: data === undefined ? null : data };
  if (meta != null) body.meta = normalizePaginationMeta(meta);
  return res.status(statusCode).json(body);
}

export function sendError(res, message = 'Error', statusCode = 400, errors = null) {
  const body = { success: false, message, data: null };
  if (errors) body.errors = errors;
  return res.status(statusCode).json(body);
}

export function sendPaginated(res, data, total, page, limit, message = 'Success') {
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const totalPages = Math.ceil(total / l) || 0;
  return res.status(200).json({
    success: true,
    message,
    data,
    meta: { total, page: p, limit: l, totalPages, totalDocs: total }
  });
}

/** Accepts legacy meta from BaseService.findMany and adds total/page aliases */
export function normalizePaginationMeta(meta) {
  if (!meta || typeof meta !== 'object') return meta;
  const out = { ...meta };
  if (out.totalDocs != null && out.total == null) out.total = out.totalDocs;
  if (out.page != null && out.totalPages != null) return out;
  return out;
}
