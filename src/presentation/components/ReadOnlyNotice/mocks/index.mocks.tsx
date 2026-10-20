import { render } from "@tests";

import { ReadOnlyNotice } from "@components";

function setup(
  props: Partial<React.ComponentProps<typeof ReadOnlyNotice>> = {},
) {
  render(
    <ReadOnlyNotice
      message="Archived family. Its data is read-only."
      testID="notice"
      {...props}
    />,
  );
}

export { setup };
