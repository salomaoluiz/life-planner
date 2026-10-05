import { render } from "@tests";

import { IconTile } from "@components";

function setup(props: Partial<React.ComponentProps<typeof IconTile>> = {}) {
  render(<IconTile name="tag" testID="tile" {...props} />);
}

export { setup };
