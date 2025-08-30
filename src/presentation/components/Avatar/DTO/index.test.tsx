import { act, screen } from "@tests";

import { avatarIconProps, avatarImageProps, avatarTextProps, setupIcon, setupImage, setupText } from "./mocks/DTO.mocks";

describe("AvatarIcon", () => {
  it("SHOULD render avatar icon with correct props", () => {
    setupIcon();

    const avatarIcon = screen.getByTestId("avatar-icon");
    expect(avatarIcon).toBeDefined();
    expect(avatarIcon.props.icon).toBe(avatarIconProps.source);
    expect(avatarIcon.props.size).toBe(avatarIconProps.size);
  });
});

describe("AvatarImage", () => {
  it("SHOULD render avatar image with correct props", () => {
    setupImage();

    const avatarImage = screen.getByTestId("avatar-image");
    expect(avatarImage).toBeDefined();
    expect(avatarImage.props.size).toBe(avatarImageProps.size);
    expect(avatarImage.props.source.uri).toBe(avatarImageProps.source);
  });

  it("SHOULD show skeleton while loading", () => {
    setupImage();

    const skeleton = screen.getByTestId("skeleton-circle");
    expect(skeleton).toBeDefined();
  });

  it("SHOULD hide skeleton when image loads", async () => {
    setupImage();

    const avatarImage = screen.getByTestId("avatar-image");
    
    // Use act to wrap the state change
    act(() => {
      avatarImage.props.onLoad();
    });

    expect(screen.queryByTestId("skeleton-circle")).toBeNull();
  });
});

describe("AvatarText", () => {
  it("SHOULD render avatar text with correct props", () => {
    setupText();

    const avatarText = screen.getByTestId("avatar-text");
    expect(avatarText).toBeDefined();
    expect(avatarText.props.label).toBe("JD");
    expect(avatarText.props.size).toBe(avatarTextProps.size);
  });

  it("SHOULD generate correct label from multi-word name", () => {
    setupText({ source: "John Doe Smith" });

    const avatarText = screen.getByTestId("avatar-text");
    expect(avatarText.props.label).toBe("JDS");
  });

  it("SHOULD handle single word name", () => {
    setupText({ source: "John" });

    const avatarText = screen.getByTestId("avatar-text");
    expect(avatarText.props.label).toBe("J");
  });
});