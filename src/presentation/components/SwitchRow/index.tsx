import { StyleSheet, View } from "react-native";

import Switch from "@components/Switch";
import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface SwitchRowProps {
  hint?: string;
  label: string;
  onToggle: (value: boolean) => void;
  testID?: string;
  value: boolean;
}

// A raised row with a label, an optional hint and a switch (the "Paid" / "Received" row of the transaction form).
function SwitchRow(props: SwitchRowProps) {
  const { colors, radius, sizes, spacing } = useKitTheme();
  const styles = StyleSheet.create({
    root: {
      alignItems: "center",
      backgroundColor: colors.surfaceRaised,
      borderRadius: radius.md,
      flexDirection: "row",
      gap: spacing.sm,
      justifyContent: "space-between",
      minHeight: sizes.touchTarget,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
    },
    text: { flex: 1, gap: spacing.xxs },
  });

  return (
    <View style={styles.root}>
      <View style={styles.text}>
        <Text.BodyStrong value={props.label} />
        {props.hint ? (
          <Text.Caption tone={"secondary"} value={props.hint} />
        ) : null}
      </View>
      <Switch
        initialStatus={props.value}
        onToggle={props.onToggle}
        testID={props.testID}
      />
    </View>
  );
}

export default SwitchRow;
