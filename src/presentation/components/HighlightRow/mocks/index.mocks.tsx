import { render } from "@tests";

import { HighlightRow } from "@components";

function setup(props: Partial<React.ComponentProps<typeof HighlightRow>> = {}) {
  render(
    <HighlightRow
      caption="Favorite account"
      icon="star"
      testID="row"
      title="Checking"
      tone="income"
      value="R$ 10,00"
      {...props}
    />,
  );
}

export { setup };
