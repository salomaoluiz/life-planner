import { StyleSheet, View } from "react-native";

import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface FieldShellProps {
  children: React.ReactNode;
  disabled?: boolean;
  error?: string;
  helper?: string;
  label?: string;
  testID?: string;
}

function FieldShell(props: FieldShellProps) {
  const { spacing } = useKitTheme();
  const { testID } = props;
  const styles = StyleSheet.create({
    root: { gap: spacing.xxs, opacity: props.disabled ? 0.5 : 1 },
  });

  const footer = props.error ? (
    <Text.Caption
      accessibilityLiveRegion="polite"
      testID={testID && `${testID}-error`}
      tone="expense"
      value={props.error}
    />
  ) : (
    props.helper && (
      <Text.Caption
        testID={testID && `${testID}-helper`}
        value={props.helper}
      />
    )
  );

  return (
    <View style={styles.root}>
      {props.label ? (
        <Text.Caption
          testID={testID && `${testID}-label`}
          value={props.label}
        />
      ) : null}
      {props.children}
      {footer}
    </View>
  );
}

export default FieldShell;
