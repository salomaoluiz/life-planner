import { Text as RNText } from "react-native";

import { render } from "@tests";

import FieldShell from "../";

function setup(props?: Partial<React.ComponentProps<typeof FieldShell>>) {
  render(
    <FieldShell label="Name" testID="shell" {...props}>
      <RNText>field</RNText>
    </FieldShell>,
  );
}

export { setup };
