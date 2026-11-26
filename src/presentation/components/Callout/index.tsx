import { StyleSheet, View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

export interface CalloutProps {
  children: React.ReactNode;
  /** `alert` is announced at once (the warning that a lot will expire before it runs out, spec 123) */
  role?: "alert";
  testID?: string;
  /** The soft tint of the box: `expense` for a loss, `warning` for something to look at */
  tone: "expense" | "warning";
}

// A tinted box that groups a message and its actions (spec 123). Not a card: it has no border.
function Callout(props: CalloutProps) {
  const { colors, radius, spacing } = useKitTheme();
  const styles = StyleSheet.create({
    root: {
      backgroundColor:
        props.tone === "expense" ? colors.expenseSoft : colors.warningSoft,
      borderRadius: radius.md,
      gap: spacing.xs,
      padding: spacing.md,
    },
  });

  return (
    <View
      accessibilityLiveRegion={props.role === "alert" ? "polite" : undefined}
      role={props.role}
      style={styles.root}
      testID={props.testID}
    >
      {props.children}
    </View>
  );
}

export default Callout;
