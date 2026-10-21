import { render } from "@tests";

import { Checkbox, CheckboxProps } from "@components";

const defaultProps: CheckboxProps = {
  checked: false,
  label: "Groceries",
  onChange: jest.fn(),
  testID: "checkbox",
};

function setup(props?: Partial<CheckboxProps>) {
  return render(<Checkbox {...defaultProps} {...props} />);
}

export { defaultProps, setup };
