import { render } from "@tests";

import { SegmentedControl } from "@components";

const options = [
  { label: "Expense", tone: "expense" as const, value: "expense" },
  { label: "Income", tone: "income" as const, value: "income" },
];
const onChange = jest.fn();

function setup(value = "expense", disabled = false) {
  render(
    <SegmentedControl
      accessibilityLabel="Type"
      disabled={disabled}
      onChange={onChange}
      options={options}
      testID="seg"
      value={value}
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { onChange, setup };
