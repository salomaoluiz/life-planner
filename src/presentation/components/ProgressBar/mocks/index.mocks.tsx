import { render } from "@tests";

import { ProgressBar } from "@components";

function setup(props: Partial<React.ComponentProps<typeof ProgressBar>> = {}) {
  render(
    <ProgressBar
      accessibilityLabel="25% used"
      progress={0.25}
      testID="progress"
      {...props}
    />,
  );
}

export { setup };
