import { Text } from "react-native";

import { render } from "@tests";

import { ChartCard } from "@components";

const onRetry = jest.fn();

function setup(props: Partial<React.ComponentProps<typeof ChartCard>> = {}) {
  render(
    <ChartCard
      errorText="Could not load"
      onRetry={onRetry}
      retryLabel="Try again"
      state="ready"
      testID="card"
      title="By category"
      {...props}
    >
      <Text>chart</Text>
    </ChartCard>,
  );
}

export { onRetry, setup };
