import TextInput, {
  TextInputMode,
  TextInputProps,
} from "@components/TextInput";
import { render } from "@tests";

type Props = TextInputProps & { mode: TextInputMode };

const defaultProps: TextInputProps = {
  onChangeText: jest.fn(),
  value: "Default Value",
  testID: "test-text-input",
};

const renderComponent = (props?: Partial<Props>) => {
  switch (props?.mode) {
    case TextInputMode.Flat:
      return <TextInput.Flat {...defaultProps} {...props} />;
    case TextInputMode.Outlined:
      return <TextInput.Outlined {...defaultProps} {...props} />;
    default:
      throw new Error("Invalid mode");
  }
};

const setup = (props?: Partial<Props>) =>
  render(renderComponent({ mode: TextInputMode.Flat, ...props }));

export { setup, defaultProps };
