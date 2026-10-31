import { render } from "@tests";

import { Spinner } from "@components";

function setup(props: Partial<React.ComponentProps<typeof Spinner>> = {}) {
  render(<Spinner accessibilityLabel="Updating" testID="spinner" {...props} />);
}

export { setup };
