import { StyleSheet, View } from "react-native";

import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface FieldShellProps {
  children: React.ReactNode;
  // Right side of the helper line, e.g. `12/1000` (spec 059).
  counter?: string;
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
    footerRow: {
      flexDirection: "row",
      gap: spacing.sm,
      justifyContent: "space-between",
    },
    root: { gap: spacing.xxs, opacity: props.disabled ? 0.5 : 1 },
  });

  const helper = props.helper ? (
    <Text.Caption testID={testID && `${testID}-helper`} value={props.helper} />
  ) : null;
  let footer: React.ReactNode = helper;

  if (props.error) {
    footer = (
      <Text.Caption
        accessibilityLiveRegion="polite"
        testID={testID && `${testID}-error`}
        tone="expense"
        value={props.error}
      />
    );
  } else if (props.counter) {
    footer = (
      <View style={styles.footerRow}>
        {helper}
        <Text.Caption
          testID={testID && `${testID}-counter`}
          value={props.counter}
        />
      </View>
    );
  }

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
