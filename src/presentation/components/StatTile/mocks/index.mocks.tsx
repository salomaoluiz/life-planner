import { render } from "@tests";

import { StatTile } from "@components";

function setup(props: Partial<React.ComponentProps<typeof StatTile>> = {}) {
  render(<StatTile label="Income" testID="tile" value="R$ 10,00" {...props} />);
}

export { setup };
