import { render } from "@tests";

import { MetricBlock } from "@components";

function setup(props: Partial<React.ComponentProps<typeof MetricBlock>> = {}) {
  render(
    <MetricBlock label="Income" testID="metric" value="R$ 10,00" {...props} />,
  );
}

export { setup };
