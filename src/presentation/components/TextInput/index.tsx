import { styles } from "./styles";
import { TextInput as PaperTextInput } from "react-native-paper";

export interface TextInputProps {
  value: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
  testID: string;
}

export enum TextInputMode {
  Flat = "flat",
  Outlined = "outlined",
}

function TextInputBase(props: TextInputProps & { mode: TextInputMode }) {
  const { onChangeText, testID, value, disabled } = props;

  return (
    <PaperTextInput
      mode={props.mode}
      testID={testID}
      disabled={disabled}
      value={value}
      onChangeText={onChangeText}
      style={styles.textInput}
    />
  );
}

function TextInputFlat(props: TextInputProps) {
  return <TextInputBase mode={TextInputMode.Flat} {...props} />;
}

function TextInputOutlined(props: TextInputProps) {
  return <TextInputBase mode={TextInputMode.Outlined} {...props} />;
}

const TextInput = {
  Flat: TextInputFlat,
  Outlined: TextInputOutlined,
};

export default TextInput;
