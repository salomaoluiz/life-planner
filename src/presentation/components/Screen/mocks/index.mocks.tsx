import "@shopify/flash-list/jestSetup";
import { FlashList } from "@shopify/flash-list";
import { Dimensions, Text } from "react-native";

import { render } from "@tests";

import { Screen } from "@components";
import * as theme from "@presentation/theme";

jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const onRefresh = jest.fn();

function getBreakpoint(width: number) {
  if (width >= 1024) {
    return "expanded";
  }

  return width >= 768 ? "medium" : "compact";
}

function listElement() {
  return (
    <FlashList
      data={[1]}
      estimatedItemSize={40}
      renderItem={() => <Text>row</Text>}
      testID="list"
    />
  );
}

function setup(
  props: Partial<React.ComponentProps<typeof Screen>> = {},
  width = 390,
) {
  jest.mocked(theme.useBreakpoint).mockReturnValue(getBreakpoint(width));
  jest
    .spyOn(Dimensions, "get")
    .mockReturnValue({ fontScale: 1, height: 800, scale: 1, width });
  render(
    <Screen testID="screen" {...props}>
      <Text>child</Text>
    </Screen>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { listElement, onRefresh, setup };
