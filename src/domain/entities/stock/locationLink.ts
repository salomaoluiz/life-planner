// Spec 117 FR 19: the QR of a location is the web link of its stock list; it carries no token (login is required).
export function locationLink(
  webBase: string | undefined,
  locationId: string,
): string {
  const base = (webBase ?? "").replace(/\/+$/, "");

  return `${base}/stock/locations/${encodeURIComponent(locationId)}`;
}
