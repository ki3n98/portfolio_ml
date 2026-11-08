// Small helpers shared across features.

/** Escape a value for safe interpolation into HTML text or attribute values. */
export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

export const isMobile = () => window.matchMedia('(max-width: 768px)').matches;
