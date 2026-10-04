import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  KeyboardTypeOptions,
  TextInput as RNTextInput,
  View,
} from "react-native";
import { TextInput as PaperTextInput } from "react-native-paper";

import Text from "../Text";
import getStyles from "./styles";

export enum TextInputMode {
  Flat = "flat",
  Outlined = "outlined",
}

export interface TextInputProps {
  autoCapitalize?: "characters" | "none" | "sentences" | "words";
  autoComplete?: PaperInputProps["autoComplete"];
  disabled?: boolean;
  error?: boolean;
  inputRef?: React.Ref<RNTextInput>;
  keyboardType?: KeyboardTypeOptions;
  label?: string;
  multiline?: boolean;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  returnKeyType?: "done" | "next";
  rightIcon?: {
    accessibilityLabel: string;
    name: string;
    onPress: () => void;
  };
  secureTextEntry?: boolean;
  testID?: string;
  textContentType?: PaperInputProps["textContentType"];
  value: string;
}

type PaperInputProps = React.ComponentProps<typeof PaperTextInput>;

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
          accessibilityLabel={label}
          activeUnderlineColor="transparent"
          autoCapitalize={props.autoCapitalize}
          autoComplete={props.autoComplete}
          disabled={disabled}
          error={props.error}
          keyboardType={props.keyboardType}
          mode="flat"
          multiline={props.multiline}
          onBlur={() => setIsFocused(false)}
          onChangeText={onChangeText}
          onFocus={() => setIsFocused(true)}
          onSubmitEditing={props.onSubmitEditing}
          placeholderTextColor={theme.colors.glassTextPlaceholder}
          ref={props.inputRef}
          returnKeyType={props.returnKeyType}
          right={
            props.rightIcon ? (
              <PaperTextInput.Icon
                accessibilityLabel={props.rightIcon.accessibilityLabel}
                icon={props.rightIcon.name}
                onPress={props.rightIcon.onPress}
              />
            ) : undefined
          }
          secureTextEntry={props.secureTextEntry}
          style={styles.textInput}
          testID={testID}
          textContentType={props.textContentType}
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
