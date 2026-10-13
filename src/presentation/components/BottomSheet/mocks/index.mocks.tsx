import { Text } from "react-native";

import { render } from "@tests";

import { BottomSheet } from "@components";
import * as theme from "@presentation/theme";

const onClose = jest.fn();

function setup(
  props: Partial<React.ComponentProps<typeof BottomSheet>> = {},
  breakpoint: "compact" | "expanded" | "medium" = "compact",
) {
  jest.mocked(theme.useBreakpoint).mockReturnValue(breakpoint);
  render(
    <BottomSheet
      closeLabel="Close"
      onClose={onClose}
      testID="sheet"
      title="New item"
      visible
      {...props}
    >
      <Text>body</Text>
    </BottomSheet>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { onClose, setup };
