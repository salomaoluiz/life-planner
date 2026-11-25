export interface BarcodeScannerProps {
  onError?: (reason: "denied" | "unavailable") => void;
  onScan: (scanned: ScannedCode) => void;
  // True while a result is shown: the camera stays on but reads nothing.
  paused?: boolean;
  testID?: string;
  torch?: boolean;
}

export interface ScannedCode {
  // The raw text of the code (a UPC-E is expanded by the caller, see `expandUpcE`).
  code: string;
  // Symbology as the scanner reports it, lower case with no separators: ean13, upc_e, qr...
  type: string;
}

// `unavailable`: no camera API (browser without `BarcodeDetector`/`getUserMedia`); `denied`: the user said no.
export type ScannerStatus = "denied" | "granted" | "loading" | "unavailable";

// Symbologies of spec 121 FR 5.
export const BARCODE_TYPES = [
  "ean13",
  "ean8",
  "upc_a",
  "upc_e",
  "itf14",
  "code128",
  "qr",
] as const;
