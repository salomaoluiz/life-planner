export interface LocationQrPrintParams {
  hint: string;
  matrix: boolean[][];
  name: string;
}

const QUIET_ZONE = 2;

export interface LocationQrLabel {
  matrix: boolean[][];
  // "Cozinha / Geladeira".
  name: string;
}

// Spec 125 FR 19: one A4 page with a grid of labels (QR + path), for labeling the whole house at once.
export function locationQrGridPrintHtml(labels: LocationQrLabel[]): string {
  const cells = labels
    .map(
      (label) =>
        `<div class="label">${qrSvg(label.matrix)}<p>${escapeHtml(label.name)}</p></div>`,
    )
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"><style>
@page { size: A4; margin: 10mm; }
body { font-family: sans-serif; margin: 0; }
.grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6mm; }
.label { border: 1px dashed #999; padding: 4mm; text-align: center; break-inside: avoid; }
.label svg { width: 40mm; height: 40mm; }
.label p { font-size: 11pt; margin: 2mm 0 0; }
</style></head><body><div class="grid">${cells}</div></body></html>`;
}

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

function qrSvg(matrix: boolean[][]): string {
  const side = matrix.length + QUIET_ZONE * 2;
  const path = matrix
    .flatMap((row, y) =>
      row.map((dark, x) =>
        dark ? `M${x + QUIET_ZONE} ${y + QUIET_ZONE}h1v1h-1z` : "",
      ),
    )
    .join("");

  return `<svg viewBox="0 0 ${side} ${side}" xmlns="http://www.w3.org/2000/svg"><rect width="${side}" height="${side}" fill="#fff"/><path d="${path}" fill="#000"/></svg>`;
}
