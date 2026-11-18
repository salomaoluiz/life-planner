export interface LocationQrPrintParams {
  hint: string;
  matrix: boolean[][];
  name: string;
}

const QUIET_ZONE = 2;

// Spec 117 FR 19: an A6 page with the QR, the location name in large type and the hint.
export function locationQrPrintHtml(params: LocationQrPrintParams): string {
  const side = params.matrix.length + QUIET_ZONE * 2;
  const path = params.matrix
    .flatMap((row, y) =>
      row.map((dark, x) =>
        dark ? `M${x + QUIET_ZONE} ${y + QUIET_ZONE}h1v1h-1z` : "",
      ),
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"><style>
@page { size: A6; margin: 8mm; }
body { font-family: sans-serif; text-align: center; margin: 0; }
h1 { font-size: 28pt; margin: 6mm 0; }
p { font-size: 12pt; margin: 4mm 0 0; }
svg { width: 80mm; height: 80mm; }
</style></head><body>
<h1>${escapeHtml(params.name)}</h1>
<svg viewBox="0 0 ${side} ${side}" xmlns="http://www.w3.org/2000/svg"><rect width="${side}" height="${side}" fill="#fff"/><path d="${path}" fill="#000"/></svg>
<p>${escapeHtml(params.hint)}</p>
</body></html>`;
}

function escapeHtml(text: string) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
