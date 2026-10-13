import { render } from "@tests";

import { ChipGroup } from "@components";

const options = [
  { label: "All", value: "all" },
  { label: "Personal", value: "personal" },
  { label: "Family", value: "family" },
];

const onChange = jest.fn();

function setupMultiple(value: string[] = ["all"]) {
  render(
    <ChipGroup
      mode="multiple"
      onChange={onChange}
      options={options}
      testID="group"
      value={value}
    />,
  );
}

function setupSingle(
  props?: Partial<{
    disabled: boolean;
    error: string;
    label: string;
    layout: "scroll" | "wrap";
    value: string;
  }>,
) {
  render(
    <ChipGroup
      mode="single"
      onChange={onChange}
      options={options}
      testID="group"
      value="all"
      {...props}
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { onChange, setupMultiple, setupSingle };
