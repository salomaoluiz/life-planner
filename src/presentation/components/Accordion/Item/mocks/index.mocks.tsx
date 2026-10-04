import { Text } from "react-native";

import { render } from "@tests";

import Item from "@components/Accordion/Item";

type Props = React.ComponentProps<typeof Item>;

// region mocks
const defaultProps: Props = {
  id: "item-1",
  left: <Text testID="item-left">Left</Text>,
  onPress: jest.fn(),
  right: <Text testID="item-right">Right</Text>,
  title: "Item title",
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(props?: Partial<Props>) {
  render(<Item {...defaultProps} {...props} />);
}

const mocks = { defaultProps };

export { mocks, setup };
export { fireEvent, hasText, screen } from "@tests";
