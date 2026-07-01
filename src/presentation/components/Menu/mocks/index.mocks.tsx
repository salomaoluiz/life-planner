import { Text } from "react-native";

import { render } from "@tests";

import Menu, { MenuProps } from "../index";

const defaultProps: MenuProps = {
  anchor: <Text testID="anchor">Anchor</Text>,
  children: <Text testID="child">Child</Text>,
  onDismiss: jest.fn(),
  visible: true,
};

function setup(props?: Partial<MenuProps>) {
  return render(<Menu {...defaultProps} {...props} />);
}

export { defaultProps, setup };
export { screen } from "@tests";
