// The encoder alone: the package entry also bundles the canvas, SVG and terminal renderers (~3x the size).
declare module "qrcode/lib/core/qrcode" {
  export function create(
    text: string,
    options?: { errorCorrectionLevel?: "H" | "L" | "M" | "Q" },
  ): { modules: { data: Uint8Array; size: number } };
}
