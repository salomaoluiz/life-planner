import { Text } from "react-native";

import { render } from "@tests";

import { ListItem } from "@components";

const onPress = jest.fn();
const onLongPress = jest.fn();

function setup(props: Partial<React.ComponentProps<typeof ListItem>> = {}) {
  render(<ListItem testID="item" title="Milk" {...props} />);
}

function setupWithSlots() {
  render(
    <ListItem
      leading={<Text>lead</Text>}
      subtitle="1 L"
      testID="item"
      title="Milk"
      trailing={<Text>trail</Text>}
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { onLongPress, onPress, setup, setupWithSlots };
