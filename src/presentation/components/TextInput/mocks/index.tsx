import { render } from "@tests";

import TextInput, {
  TextInputMode,
  TextInputProps,
} from "@components/TextInput";

type Props = TextInputProps & { mode: TextInputMode };

const defaultProps: TextInputProps = {
  onChangeText: jest.fn(),
  testID: "test-text-input",
  value: "Default Value",
};

function renderComponent(props?: Partial<Props>) {
  switch (props?.mode) {
    case TextInputMode.Flat:
      return <TextInput.Flat {...defaultProps} {...props} />;
    case TextInputMode.Outlined:
      return <TextInput.Outlined {...defaultProps} {...props} />;
    default:
      throw new Error("Invalid mode");
  }
}

function setup(props?: Partial<Props>) {
  render(renderComponent({ mode: TextInputMode.Flat, ...props }));
}

export { defaultProps, setup };
