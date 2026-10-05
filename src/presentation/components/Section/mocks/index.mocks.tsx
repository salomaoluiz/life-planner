import { Text } from "react-native";

import { render } from "@tests";

import { Section } from "@components";

const onActionPress = jest.fn();

function setup(props: Partial<React.ComponentProps<typeof Section>> = {}) {
  render(
    <Section testID="section" title="Expiring" {...props}>
      <Text>child</Text>
    </Section>,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { onActionPress, setup };
