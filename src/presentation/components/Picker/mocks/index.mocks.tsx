import { render } from "@tests";

import Picker, { PickerProps } from "../index";

const defaultProps: PickerProps<string> = {
  items: [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
  ],
  label: "Test Picker",
  onValueChange: jest.fn(),
  selectedValue: "option1",
  testID: "test-picker",
};

function setup<T>(props?: Partial<PickerProps<T>>) {
  const finalProps = { ...defaultProps, ...props } as PickerProps<T>;
  render(<Picker {...finalProps} />);
}

export { defaultProps, setup };
