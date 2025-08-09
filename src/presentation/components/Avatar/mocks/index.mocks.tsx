import { render } from "@tests";

import Avatar from "../index";
import { AvatarProps } from "../types";

// region mocks
const defaultProps = {
  icon: {
    mode: "icon" as const,
    source: "account",
  },
  image: {
    mode: "image" as const,
    source: "https://example.com/avatar.jpg",
  },
  text: {
    mode: "text" as const,
    source: "John Doe",
  },
};
// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

const setup = {
  large: {
    icon: (props?: Partial<AvatarProps>) =>
      render(<Avatar.Large {...defaultProps.icon} {...props} />),
    image: (props?: Partial<AvatarProps>) =>
      render(<Avatar.Large {...defaultProps.image} {...props} />),
    text: (props?: Partial<AvatarProps>) =>
      render(<Avatar.Large {...defaultProps.text} {...props} />),
  },
  regular: {
    icon: (props?: Partial<AvatarProps>) =>
      render(<Avatar.Regular {...defaultProps.icon} {...props} />),
    image: (props?: Partial<AvatarProps>) =>
      render(<Avatar.Regular {...defaultProps.image} {...props} />),
    text: (props?: Partial<AvatarProps>) =>
      render(<Avatar.Regular {...defaultProps.text} {...props} />),
  },
  small: {
    icon: (props?: Partial<AvatarProps>) =>
      render(<Avatar.Small {...defaultProps.icon} {...props} />),
    image: (props?: Partial<AvatarProps>) =>
      render(<Avatar.Small {...defaultProps.image} {...props} />),
    text: (props?: Partial<AvatarProps>) =>
      render(<Avatar.Small {...defaultProps.text} {...props} />),
  },
};

const spies = {};

const mocks = {};

export { defaultProps, mocks, setup, spies };
export { screen } from "@tests";
