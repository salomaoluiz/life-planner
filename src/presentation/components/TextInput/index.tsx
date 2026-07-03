import { BlurView } from "expo-blur";
import React, { useState } from "react";
import { KeyboardTypeOptions, View } from "react-native";
import { TextInput as PaperTextInput } from "react-native-paper";

import Text from "../Text";
import getStyles from "./styles";

export enum TextInputMode {
  Flat = "flat",
  Outlined = "outlined",
}

export interface TextInputProps {
  disabled?: boolean;
  keyboardType?: KeyboardTypeOptions;
  label?: string;
  multiline?: boolean;
  onChangeText: (text: string) => void;
  testID?: string;
  value: string;
}

function TextInputBase(props: TextInputProps & { mode: TextInputMode }) {
  const { disabled, label, onChangeText, testID, value } = props;
  const [isFocused, setIsFocused] = useState(false);
  const { styles, theme } = getStyles({ disabled: !!disabled, isFocused });

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.labelContainer}>
          <Text.Body color={theme.colors.onBackground} value={label} />
        </View>
      )}
      <BlurView
        intensity={theme.dark ? 20 : 40}
        style={styles.blurView}
        tint={theme.dark ? "dark" : "light"}
      >
        <PaperTextInput
          activeUnderlineColor="transparent"
          disabled={disabled}
          keyboardType={props.keyboardType}
          mode="flat"
          multiline={props.multiline}
          onBlur={() => setIsFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          placeholderTextColor={theme.colors.glassTextPlaceholder}
          style={styles.textInput}
          testID={testID}
          theme={{
            colors: {
              background: "transparent",
            },
          }}
          underlineColor="transparent"
          value={value}
        />
      </BlurView>
    </View>
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
