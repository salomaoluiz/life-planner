import { act, screen } from "@tests";

import { setup } from "./mocks/index.mocks";

describe("Avatar Component", () => {
  describe("Large Size", () => {
    it("SHOULD render Large Avatar in icon mode with correct props", () => {
      setup.large.icon();

      const avatar = screen.getByTestId("avatar-icon");

      expect(avatar.props).toEqual({
        children: undefined,
        icon: "account",
        size: 55, // 48 * 1.15 (tablet scaling)
        testID: "avatar-icon",
      });
    });

    it("SHOULD render Large Avatar in image mode with correct props", () => {
      setup.large.image();

      const avatar = screen.getByTestId("avatar-image");

      expect(avatar.props).toEqual({
        children: undefined,
        onLoad: expect.any(Function),
        size: 55, // 48 * 1.15 (tablet scaling)
        source: { uri: "https://example.com/avatar.jpg" },
        testID: "avatar-image",
      });
    });

    it("SHOULD render Large Avatar in text mode with correct props", () => {
      setup.large.text();

      const avatar = screen.getByTestId("avatar-text");

      expect(avatar.props).toEqual({
        children: undefined,
        label: "JD",
        size: 55, // 48 * 1.15 (tablet scaling)
        testID: "avatar-text",
      });
    });
  });

  describe("Regular Size", () => {
    it("SHOULD render Regular Avatar in icon mode with correct props", () => {
      setup.regular.icon();

      const avatar = screen.getByTestId("avatar-icon");

      expect(avatar.props).toEqual({
        children: undefined,
        icon: "account",
        size: 37, // 32 * 1.15 (tablet scaling)
        testID: "avatar-icon",
      });
    });

    it("SHOULD render Regular Avatar in image mode with correct props", () => {
      setup.regular.image();

      const avatar = screen.getByTestId("avatar-image");

      expect(avatar.props).toEqual({
        children: undefined,
        onLoad: expect.any(Function),
        size: 37, // 32 * 1.15 (tablet scaling)
        source: { uri: "https://example.com/avatar.jpg" },
        testID: "avatar-image",
      });
    });

    it("SHOULD render Regular Avatar in text mode with correct props", () => {
      setup.regular.text();

      const avatar = screen.getByTestId("avatar-text");

      expect(avatar.props).toEqual({
        children: undefined,
        label: "JD",
        size: 37, // 32 * 1.15 (tablet scaling)
        testID: "avatar-text",
      });
    });
  });

  describe("Small Size", () => {
    it("SHOULD render Small Avatar in icon mode with correct props", () => {
      setup.small.icon();

      const avatar = screen.getByTestId("avatar-icon");

      expect(avatar.props).toEqual({
        children: undefined,
        icon: "account",
        size: 28, // 24 * 1.15 (tablet scaling)
        testID: "avatar-icon",
      });
    });

    it("SHOULD render Small Avatar in image mode with correct props", () => {
      setup.small.image();

      const avatar = screen.getByTestId("avatar-image");

      expect(avatar.props).toEqual({
        children: undefined,
        onLoad: expect.any(Function),
        size: 28, // 24 * 1.15 (tablet scaling)
        source: { uri: "https://example.com/avatar.jpg" },
        testID: "avatar-image",
      });
    });

    it("SHOULD render Small Avatar in text mode with correct props", () => {
      setup.small.text();

      const avatar = screen.getByTestId("avatar-text");

      expect(avatar.props).toEqual({
        children: undefined,
        label: "JD",
        size: 28, // 24 * 1.15 (tablet scaling)
        testID: "avatar-text",
      });
    });
  });

  describe("Text mode label generation", () => {
    it("SHOULD generate correct initials for single name", () => {
      setup.large.text({ source: "John" });

      const avatar = screen.getByTestId("avatar-text");
      expect(avatar.props.label).toBe("J");
    });

    it("SHOULD generate correct initials for two names", () => {
      setup.large.text({ source: "John Doe" });

      const avatar = screen.getByTestId("avatar-text");
      expect(avatar.props.label).toBe("JD");
    });

    it("SHOULD generate correct initials for three names", () => {
      setup.large.text({ source: "John Michael Doe" });

      const avatar = screen.getByTestId("avatar-text");
      expect(avatar.props.label).toBe("JMD");
    });

    it("SHOULD handle lowercase names correctly", () => {
      setup.large.text({ source: "john doe" });

      const avatar = screen.getByTestId("avatar-text");
      expect(avatar.props.label).toBe("JD");
    });
  });

  describe("AvatarImage onLoad functionality", () => {
    it("SHOULD call onLoad and hide skeleton when image loads", () => {
      setup.large.image();

      const avatarImage = screen.getByTestId("avatar-image");
      
      // Initially the skeleton should be rendered (loading state)
      expect(screen.queryByTestId("skeleton-loader")).toBeTruthy();

      // Simulate image load
      act(() => {
        avatarImage.props.onLoad();
      });

      // After loading, skeleton should be hidden
      expect(screen.queryByTestId("skeleton-loader")).toBeNull();
    });

    it("SHOULD have onLoad function in AvatarImage props", () => {
      setup.regular.image();

      const avatar = screen.getByTestId("avatar-image");
      expect(avatar.props.onLoad).toEqual(expect.any(Function));
    });
  });
});
