import React from "react";
import { render } from "@tests";

import { AvatarIcon, AvatarImage, AvatarText } from "../";

// Mock react-native-paper
jest.mock("react-native-paper", () => ({
  Avatar: {
    Icon: ({ icon, size, testID }: any) => (
      <MockedComponent testID={testID} icon={icon} size={size} />
    ),
    Image: ({ size, source, testID, onLoad }: any) => (
      <MockedComponent
        testID={testID}
        size={size}
        source={source}
        onLoad={onLoad}
      />
    ),
    Text: ({ label, size, testID }: any) => (
      <MockedComponent testID={testID} label={label} size={size} />
    ),
  },
}));

// Mock Skeleton component  
jest.mock("@components/Skeleton", () => ({
  Circle: ({ size }: any) => {
    // Only render skeleton if it would be visible based on the current test state
    const React = require("react");
    return React.createElement("div", { testID: "skeleton-circle", size });
  },
}));

function MockedComponent(props: any) {
  return <div {...props} />;
}

interface AvatarDTOProps {
  size: number;
  source: string;
}

const avatarIconProps: AvatarDTOProps = {
  size: 40,
  source: "account",
};

const avatarImageProps: AvatarDTOProps = {
  size: 40,
  source: "https://example.com/avatar.jpg",
};

const avatarTextProps: AvatarDTOProps = {
  size: 40,
  source: "John Doe",
};

function setupIcon(props?: Partial<AvatarDTOProps>) {
  render(<AvatarIcon {...avatarIconProps} {...props} />);
}

function setupImage(props?: Partial<AvatarDTOProps>) {
  render(<AvatarImage {...avatarImageProps} {...props} />);
}

function setupText(props?: Partial<AvatarDTOProps>) {
  render(<AvatarText {...avatarTextProps} {...props} />);
}

export {
  avatarIconProps,
  avatarImageProps,
  avatarTextProps,
  setupIcon,
  setupImage,
  setupText,
};