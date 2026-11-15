import { render } from "@tests";

import { ColorMark, ShareBar } from "@components";

function setup(props: Partial<React.ComponentProps<typeof ColorMark>> = {}) {
  render(<ColorMark color="#4F5BD5" testID="mark" {...props} />);
}

function setupBar(props: Partial<React.ComponentProps<typeof ShareBar>> = {}) {
  render(
    <ShareBar
      accessibilityLabel="Share of the largest asset"
      color="#4F5BD5"
      progress={0.5}
      testID="share"
      {...props}
    />,
  );
}

export { setup, setupBar };
