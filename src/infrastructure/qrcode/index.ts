import { create } from "qrcode/lib/core/qrcode";

// The QR code of a text as rows of dark (true) and light (false) modules, generated on the device (spec 117 FR 19).
function qrMatrix(text: string): boolean[][] {
  const { modules } = create(text, { errorCorrectionLevel: "M" });
  const { data, size } = modules;

  return Array.from({ length: size }, (_row, row) =>
    Array.from(
      { length: size },
      (_column, column) => data[row * size + column] === 1,
    ),
  );
}

export { qrMatrix };
