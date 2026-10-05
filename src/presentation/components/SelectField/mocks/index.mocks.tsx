import { render } from "@tests";

import { SelectField } from "@components";

const onChange = jest.fn();
const options = [
  { description: "1000 g", label: "Kilogram", value: "kg" },
  { label: "Gram", value: "g" },
];

function manyOptions(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    label: `Option ${index}`,
    value: `o${index}`,
  }));
}

function setup(props: Partial<React.ComponentProps<typeof SelectField>> = {}) {
  render(
    <SelectField
      closeLabel="Close"
      label="Unit"
      onChange={onChange}
      options={options}
      placeholder="Choose"
      sheetTitle="Unit"
      testID="select"
      value="kg"
      {...props}
    />,
  );
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { manyOptions, onChange, setup };
