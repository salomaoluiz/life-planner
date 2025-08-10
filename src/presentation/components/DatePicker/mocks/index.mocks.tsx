import { render } from "@tests";

import { DatePicker, DatePickerProps } from "@components";

const defaultProps: DatePickerProps = {
  label: "Select Date",
  mode: "single",
  onConfirm: jest.fn(),
  onDismiss: jest.fn(),
  testID: "default-date-picker",
};

function setup(props?: Partial<DatePickerProps>) {
  render(<DatePicker {...defaultProps} {...props} />);
}

export { defaultProps, setup };
