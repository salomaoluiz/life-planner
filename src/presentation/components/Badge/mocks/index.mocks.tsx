import { render } from "@tests";

import { Badge } from "@components";

function setup(props: Partial<React.ComponentProps<typeof Badge>> = {}) {
  render(<Badge label="Expired" testID="badge" {...props} />);
}

export { setup };
