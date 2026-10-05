import { render } from "@tests";

import { TextField } from "@components";

import { TextFieldProps } from "../";

const defaultProps = {
  label: "Name",
  onChangeText: jest.fn(),
  testID: "field",
  value: "",
};

function setup(props?: Partial<TextFieldProps>) {
  render(<TextField {...defaultProps} {...(props as object)} />);
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { defaultProps, setup };
