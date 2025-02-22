import { styles } from "./styles";
import { Button as PaperButton } from "react-native-paper";

export interface ButtonProps {
  label: string;
  onPress: () => void;
  testID: string;
}

export enum ButtonMode {
  Text = "text",
  Filled = "contained",
  Outlined = "outlined",
}

function ButtonBase(props: ButtonProps & { mode: ButtonMode }) {
  return (
    <PaperButton
      mode={props.mode}
      onPress={props.onPress}
      style={styles.buttonBase}
      testID={props.testID}
    >
      {props.label}
    </PaperButton>
  );
}

function ButtonText(props: ButtonProps) {
  return <ButtonBase mode={ButtonMode.Text} {...props} />;
}

function ButtonFilled(props: ButtonProps) {
  return <ButtonBase mode={ButtonMode.Filled} {...props} />;
}

function ButtonOutlined(props: ButtonProps) {
  return <ButtonBase mode={ButtonMode.Outlined} {...props} />;
}

const Button = {
  Text: ButtonText,
  Filled: ButtonFilled,
  Outlined: ButtonOutlined,
};

export default Button;
