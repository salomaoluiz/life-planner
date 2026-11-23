import { BARCODE_TYPES, ScannedCode } from "./types";

type BarcodeDetectorCtor = new (options: {
  formats: string[];
}) => BarcodeDetectorLike;

interface BarcodeDetectorLike {
  detect(source: unknown): Promise<DetectedBarcode[]>;
}

interface DetectedBarcode {
  format: string;
  rawValue: string;
}

// The browser formats are spelled with hyphens (`ean_13`); the scanner types without (`ean13`).
const FORMAT_BY_TYPE: Record<string, string> = {
  code128: "code_128",
  ean8: "ean_8",
  ean13: "ean_13",
  itf14: "itf",
  qr: "qr_code",
  upc_a: "upc_a",
  upc_e: "upc_e",
};
const TYPE_BY_FORMAT = Object.fromEntries(
  Object.entries(FORMAT_BY_TYPE).map(([type, format]) => [format, type]),
);

export function createWebDetector() {
  const Detector = detectorConstructor();

  if (!Detector) {
    return undefined;
  }

  const detector = new Detector({
    formats: BARCODE_TYPES.map((type) => FORMAT_BY_TYPE[type]),
  });

  return {
    async detect(video: unknown): Promise<ScannedCode | undefined> {
      const [found] = await detector.detect(video);

      return found
        ? {
            code: found.rawValue,
            type: TYPE_BY_FORMAT[found.format] ?? found.format,
          }
        : undefined;
    },
  };
}

// Spec 121 FR 6: the camera preview needs both `getUserMedia` and `BarcodeDetector` (Chromium); the typed field covers the rest.
export function isWebScanSupported(): boolean {
  return (
    detectorConstructor() !== undefined &&
    typeof navigator !== "undefined" &&
    typeof navigator.mediaDevices?.getUserMedia === "function"
  );
}

function detectorConstructor(): BarcodeDetectorCtor | undefined {
  return (globalThis as unknown as { BarcodeDetector?: BarcodeDetectorCtor })
    .BarcodeDetector;
}
