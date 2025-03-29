import React from "react";
import { Button as PaperButton } from "react-native-paper";

import { styles } from "./styles";
import getCustomStyles, { CustomStyles } from "./styles/customStyles";

export enum ButtonMode {
  Filled = "contained",
  Outlined = "outlined",
  Text = "text",
}

export interface ButtonProps {
  customStyles?: CustomStyles;
  disabled?: boolean;
  icon?: (() => React.ReactNode) | string;
  label: string;
  onPress: () => void;
  testID?: string;
}

function ButtonBase(props: ButtonProps & { mode: ButtonMode }) {
  const customStyles = getCustomStyles({
    customStyles: props.customStyles,
    disabled: props.disabled,
  });

  return (
    <PaperButton
      disabled={props.disabled}
      icon={props.icon}
      mode={props.mode}
      onPress={props.onPress}
      style={[styles.buttonBase, customStyles.styles]}
      testID={props.testID}
      {...customStyles.props}
    >
      {props.label}
    </PaperButton>
  );
}

function ButtonFilled(props: ButtonProps) {
  return <ButtonBase mode={ButtonMode.Filled} {...props} />;
}

function ButtonOutlined(props: ButtonProps) {
  return <ButtonBase mode={ButtonMode.Outlined} {...props} />;
}

function ButtonText(props: ButtonProps) {
  return <ButtonBase mode={ButtonMode.Text} {...props} />;
}

const Button = {
  Filled: ButtonFilled,
  Outlined: ButtonOutlined,
  Text: ButtonText,
};

export default Button;
