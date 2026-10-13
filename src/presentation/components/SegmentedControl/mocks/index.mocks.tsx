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

function setupAccent() {
  render(
    <SegmentedControl
      accessibilityLabel="Kind"
      onChange={onChange}
      options={[
        { label: "A", value: "a" },
        { label: "B", value: "b" },
      ]}
      testID="seg"
      value="a"
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { onChange, setup, setupAccent };
