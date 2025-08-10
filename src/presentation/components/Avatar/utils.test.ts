import { useTheme } from "@presentation/theme";
import { lightTheme } from "@presentation/theme/provider";

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
        ...lightTheme,
      },
    } as const);
  });

  describe("getAvatarSize", () => {
    it("SHOULD return correct size for large", () => {
      const size = getAvatarSize("large");
      expect(size).toBe(lightTheme.sizes.spacing.xxlarge);
    });

    it("SHOULD return correct size for regular", () => {
      const size = getAvatarSize("regular");
      expect(size).toBe(lightTheme.sizes.spacing.xlarge);
    });

    it("SHOULD return correct size for small", () => {
      const size = getAvatarSize("small");
      expect(size).toBe(lightTheme.sizes.spacing.large);
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
