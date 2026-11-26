import { render } from "@tests";

import { CategoryTreeField } from "@components";
import {
  labels,
  nodes,
} from "@components/CategoryTreePicker/mocks/index.mocks";

const onChange = jest.fn();

function setup(
  props: Partial<React.ComponentProps<typeof CategoryTreeField>> = {},
) {
  return render(
    <CategoryTreeField
      archivedLabel="Archived"
      label="Category"
      labels={labels}
      mode="single"
      mostUsedIds={["home"]}
      nodes={nodes}
      onChange={onChange}
      testID="field"
      value="market"
      {...(props as object)}
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { onChange, setup };
