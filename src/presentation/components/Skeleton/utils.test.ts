import { getSize } from "./utils";

// Mock the device utils
jest.mock("@utils/device", () => ({
  getWindowsSizes: jest.fn(() => ({
    height: 800,
    width: 400,
  })),
}));

describe("Skeleton Utils", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("getSize function", () => {
    it("SHOULD return the same value when size is a number", () => {
      const size = 100;
      const result = getSize(size, "width");
      expect(result).toBe(100);
    });

    it("SHOULD calculate width percentage correctly", () => {
      const size = "50%";
      const result = getSize(size, "width");
      // 50% of 400 (mocked width) = 200
      expect(result).toBe(200);
    });

    it("SHOULD calculate height percentage correctly", () => {
      const size = "25%";
      const result = getSize(size, "height");
      // 25% of 800 (mocked height) = 200
      expect(result).toBe(200);
    });

    it("SHOULD handle 100% width correctly", () => {
      const size = "100%";
      const result = getSize(size, "width");
      expect(result).toBe(400);
    });

    it("SHOULD handle 100% height correctly", () => {
      const size = "100%";
      const result = getSize(size, "height");
      expect(result).toBe(800);
    });

    it("SHOULD handle 0% correctly", () => {
      const size = "0%";
      const result = getSize(size, "width");
      expect(result).toBe(0);
    });

    it("SHOULD handle decimal percentages for width", () => {
      const size = "33.33%";
      const result = getSize(size, "width");
      // 33.33% of 400 = 133.32
      expect(result).toBeCloseTo(133.32);
    });

    it("SHOULD handle decimal percentages for height", () => {
      const size = "12.5%";
      const result = getSize(size, "height");
      // 12.5% of 800 = 100
      expect(result).toBe(100);
    });

    it("SHOULD handle large percentages", () => {
      const size = "150%";
      const result = getSize(size, "width");
      // 150% of 400 = 600
      expect(result).toBe(600);
    });

    it("SHOULD handle float numbers", () => {
      const size = 50.5;
      const result = getSize(size, "height");
      expect(result).toBe(50.5);
    });

    it("SHOULD handle negative numbers", () => {
      const size = -10;
      const result = getSize(size, "width");
      expect(result).toBe(-10);
    });

    it("SHOULD handle zero as number", () => {
      const size = 0;
      const result = getSize(size, "height");
      expect(result).toBe(0);
    });

    it("SHOULD correctly parse percentage string without % sign internally", () => {
      const size = "75%";
      const result = getSize(size, "width");
      // 75% of 400 = 300
      expect(result).toBe(300);
    });
  });
});
