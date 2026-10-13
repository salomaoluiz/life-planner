import { useState } from "react";
import { KeyboardTypeOptions, TextInput, View } from "react-native";

import FieldShell from "@components/FieldShell";
import FocusRing from "@components/FocusRing";
import Icon, { IconButton } from "@components/Icon";

import useStyles, { getFrameStyle } from "./styles";

export type TextFieldProps = SecureProps & {
  autoCapitalize?: "characters" | "none" | "sentences" | "words";
  autoComplete?: React.ComponentProps<typeof TextInput>["autoComplete"];
  disabled?: boolean;
  error?: string;
  helper?: string;
  inputRef?: React.Ref<TextInput>;
  keyboardType?: KeyboardTypeOptions;
  label: string;
  leftIcon?: string;
  maxLength?: number;
  multiline?: boolean;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  placeholder?: string;
  returnKeyType?: "done" | "next";
  testID?: string;
  textContentType?: React.ComponentProps<typeof TextInput>["textContentType"];
  value: string;
};

type SecureProps =
  | {
      hidePasswordLabel: string;
      secureTextEntry: true;
      showPasswordLabel: string;
    }
  | {
      hidePasswordLabel?: never;
      secureTextEntry?: false;
      showPasswordLabel?: never;
    };

function TextField(props: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const { multilineFrame, styles, theme } = useStyles(!!props.multiline);
  const { testID } = props;

  return (
    <FieldShell
      disabled={props.disabled}
      error={props.error}
      helper={props.helper}
      label={props.label}
      testID={testID}
    >
      <View
        style={[
          getFrameStyle({
            disabled: props.disabled,
            error: !!props.error,
            focused,
            theme,
          }),
          multilineFrame,
        ]}
        testID={testID && `${testID}-frame`}
      >
        {props.leftIcon ? (
          <View style={styles.icon}>
            <Icon
              color={theme.colors.textSecondary}
              name={props.leftIcon}
              size={theme.sizes.iconMd}
            />
          </View>
        ) : null}
        <TextInput
          accessibilityHint={props.error}
          accessibilityLabel={props.label}
          autoCapitalize={props.autoCapitalize}
          autoComplete={props.autoComplete}
          editable={!props.disabled}
          keyboardType={props.keyboardType}
          maxLength={props.maxLength}
          multiline={props.multiline}
          onBlur={() => setFocused(false)}
          onChangeText={props.onChangeText}
          onFocus={() => setFocused(true)}
          onSubmitEditing={props.onSubmitEditing}
          placeholder={props.placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          ref={props.inputRef}
          returnKeyType={props.returnKeyType}
          secureTextEntry={props.secureTextEntry && hidden}
          style={styles.input}
          testID={testID}
          textContentType={props.textContentType}
          value={props.value}
        />
        {props.secureTextEntry ? (
          <IconButton
            accessibilityLabel={
              hidden ? props.showPasswordLabel : props.hidePasswordLabel
            }
            name={hidden ? "eye-outline" : "eye-off-outline"}
            onPress={() => setHidden((current) => !current)}
            testID={testID && `${testID}-toggle`}
            variant="plain"
          />
        ) : null}
        <FocusRing radius={theme.radius.md} visible={focused} />
      </View>
    </FieldShell>
  );
}

export default TextField;
