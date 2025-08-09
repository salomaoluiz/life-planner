import { useTheme } from "@presentation/theme";

import { getAvatarComponent, getAvatarSize } from "./utils";

// Mock the theme
jest.mock("@presentation/theme");

const mockUseTheme = useTheme as jest.MockedFunction<typeof useTheme>;

describe("Avatar Utils", () => {
  beforeEach(() => {
    mockUseTheme.mockReturnValue({
      isDark: false,
      setIsDark: jest.fn(),
      theme: {
        sizes: {
          spacing: {
            large: 24,
            xlarge: 32,
            xxlarge: 48,
          },
        },
      },
    } as const);
  });

  describe("getAvatarSize", () => {
    it("SHOULD return correct size for large", () => {
      const size = getAvatarSize("large");
      expect(size).toBe(48);
    });

    it("SHOULD return correct size for regular", () => {
      const size = getAvatarSize("regular");
      expect(size).toBe(32);
    });

    it("SHOULD return correct size for small", () => {
      const size = getAvatarSize("small");
      expect(size).toBe(24);
    });
  });

  describe("getAvatarComponent", () => {
    it("SHOULD return AvatarIcon for icon mode", () => {
      const component = getAvatarComponent({
        mode: "icon",
        size: "large",
        source: "test",
      });
      expect(component.name).toBe("AvatarIcon");
    });

    it("SHOULD return AvatarImage for image mode", () => {
      const component = getAvatarComponent({
        mode: "image",
        size: "large",
        source: "test",
      });
      expect(component.name).toBe("AvatarImage");
    });

    it("SHOULD return AvatarText for text mode", () => {
      const component = getAvatarComponent({
        mode: "text",
        size: "large",
        source: "test",
      });
      expect(component.name).toBe("AvatarText");
    });
  });
});
