import { TextInput as PaperTextInput } from "react-native-paper";

import getSyles from "./styles";

export enum TextInputMode {
  Flat = "flat",
  Outlined = "outlined",
}

export interface TextInputProps {
  disabled?: boolean;
  label?: string;
  multiline?: boolean;
  onChangeText: (text: string) => void;
  testID?: string;
  value: string;
}

function TextInputBase(props: TextInputProps & { mode: TextInputMode }) {
  const { disabled, onChangeText, testID, value } = props;
  const styles = getSyles();

  return (
    <PaperTextInput
      disabled={disabled}
      label={props.label}
      mode={props.mode}
      multiline={props.multiline}
      onChangeText={onChangeText}
      style={styles.textInput}
      testID={testID}
      value={value}
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
