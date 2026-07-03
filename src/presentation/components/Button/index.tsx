import { BlurView } from "expo-blur";
import React from "react";
import { View } from "react-native";
import { Button as PaperButton } from "react-native-paper";

import { useTheme } from "@presentation/theme";

import { styles } from "./styles";
import getCustomStyles, {
  ButtonMode,
  CustomStyles,
} from "./styles/customStyles";

export { ButtonMode };

export interface ButtonProps {
  customStyles?: CustomStyles;
  disabled?: boolean;
  icon?: (() => React.ReactNode) | string;
  label: string;
  onPress: () => void;
  testID?: string;
}

function ButtonBase(props: ButtonProps & { mode: ButtonMode }) {
  const { theme } = useTheme();

  const customStyles = getCustomStyles({
    customStyles: props.customStyles,
    disabled: props.disabled,
    mode: props.mode,
    theme,
  });

  const isTextMode = props.mode === ButtonMode.Text;

  if (isTextMode) {
    return (
      <PaperButton
        disabled={props.disabled}
        icon={props.icon}
        mode="text"
        onPress={props.onPress}
        style={[styles.buttonBase, customStyles.styles]}
        testID={props.testID}
        {...customStyles.props}
      >
        {props.label}
      </PaperButton>
    );
  }

  return (
    <View style={[styles.buttonWrapper, props.disabled && styles.disabled]}>
      <BlurView
        intensity={props.mode === ButtonMode.Filled ? 40 : 15}
        style={styles.blurView}
        tint={theme.dark ? "dark" : "light"}
      >
        <PaperButton
          contentStyle={styles.buttonContent}
          disabled={props.disabled}
          icon={props.icon}
          mode="text"
          onPress={props.onPress}
          style={[styles.buttonBase, customStyles.styles]}
          testID={props.testID}
          {...customStyles.props}
        >
          {props.label}
        </PaperButton>
      </BlurView>
    </View>
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
