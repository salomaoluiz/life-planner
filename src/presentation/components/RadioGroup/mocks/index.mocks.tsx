import { render } from "@tests";

import { RadioGroup } from "@components";

const options = [
  { label: "Only this one", value: "ONLY_THIS" },
  { label: "This and the next ones", value: "THIS_AND_NEXT" },
  { disabled: true, label: "All", value: "ALL" },
];
const onChange = jest.fn();

function setup(value = "ONLY_THIS", disabled = false) {
  render(
    <RadioGroup
      accessibilityLabel="Edit"
      disabled={disabled}
      onChange={onChange}
      options={options}
      testID="radio"
      value={value}
    />,
  );
}

export { onChange, setup };
