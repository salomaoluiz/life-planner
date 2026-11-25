import { createWebDetector, isWebScanSupported } from "./webDetector";

type Globals = typeof globalThis & {
  BarcodeDetector?: unknown;
};

const globals = globalThis as Globals;
const original = globals.BarcodeDetector;
const originalDevices = Object.getOwnPropertyDescriptor(
  globalThis.navigator,
  "mediaDevices",
);

afterEach(() => {
  globals.BarcodeDetector = original;

  if (originalDevices) {
    Object.defineProperty(
      globalThis.navigator,
      "mediaDevices",
      originalDevices,
    );
  } else {
    // @ts-expect-error restoring a property the test environment did not have
    delete globalThis.navigator.mediaDevices;
  }
});

function withCamera() {
  Object.defineProperty(globalThis.navigator, "mediaDevices", {
    configurable: true,
    value: { getUserMedia: jest.fn() },
  });
}

describe("isWebScanSupported", () => {
  it("SHOULD need BarcodeDetector AND getUserMedia", () => {
    globals.BarcodeDetector = undefined;
    withCamera();
    expect(isWebScanSupported()).toBe(false);

    globals.BarcodeDetector = class {};
    expect(isWebScanSupported()).toBe(true);
  });

  it("SHOULD be false WITHOUT a camera API", () => {
    globals.BarcodeDetector = class {};
    Object.defineProperty(globalThis.navigator, "mediaDevices", {
      configurable: true,
      value: undefined,
    });

    expect(isWebScanSupported()).toBe(false);
  });
});

describe("createWebDetector", () => {
  it("SHOULD ask for the supported formats AND map the found one to a scanner type", async () => {
    const formats: string[][] = [];

    globals.BarcodeDetector = class {
      constructor(options: { formats: string[] }) {
        formats.push(options.formats);
      }

      async detect() {
        return [{ format: "ean_13", rawValue: "7891000100103" }];
      }
    };

    const detector = createWebDetector();

    expect(await detector?.detect({})).toEqual({
      code: "7891000100103",
      type: "ean13",
    });
    expect(formats[0]).toEqual(
      expect.arrayContaining(["ean_13", "ean_8", "upc_a", "upc_e", "qr_code"]),
    );
  });

  it("SHOULD return nothing WHEN no code is in sight", async () => {
    globals.BarcodeDetector = class {
      async detect() {
        return [];
      }
    };

    expect(await createWebDetector()?.detect({})).toBeUndefined();
  });

  it("SHOULD be undefined WITHOUT BarcodeDetector", () => {
    globals.BarcodeDetector = undefined;

    expect(createWebDetector()).toBeUndefined();
  });
});
