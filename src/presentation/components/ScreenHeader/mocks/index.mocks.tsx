import { Text } from "react-native";

import { render } from "@tests";

import { ScreenHeader } from "@components";

function setup(props: Partial<React.ComponentProps<typeof ScreenHeader>> = {}) {
  render(<ScreenHeader testID="header" title="Stock" {...props} />);
}

function setupFull() {
  render(
    <ScreenHeader
      actions={<Text>action</Text>}
      overline="Monday, 5 October"
      subtitle="12 items"
      testID="header"
      title="Stock"
    />,
  );
}

export { setup, setupFull };
