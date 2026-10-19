import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

export interface GroupBodyRowProps {
  children: ReactNode;
  /** Closes the card a pressable `GroupHeader` opened (bottom border and radius) */
  isLast?: boolean;
  testID?: string;
  /** `bare` = no card chrome, for rows inside a tooltip */
  variant?: "bare" | "card";
}

// A row of the body under an expanded `GroupHeader`: same card, a hairline between rows.
function GroupBodyRow(props: GroupBodyRowProps) {
  const { colors, radius, spacing } = useKitTheme();
  const card = props.variant !== "bare";
  const closing = card && !!props.isLast;
  const styles = StyleSheet.create({
    card: {
      backgroundColor: card ? colors.surface : undefined,
      borderBottomLeftRadius: closing ? radius.md : 0,
      borderBottomRightRadius: closing ? radius.md : 0,
      borderBottomWidth: closing ? 1 : 0,
      borderColor: colors.border,
      borderLeftWidth: card ? 1 : 0,
      borderRightWidth: card ? 1 : 0,
      paddingHorizontal: card ? spacing.sm : 0,
    },
    divider: { backgroundColor: colors.border, height: 1, opacity: 0.6 },
  });

  return (
    <View style={styles.card} testID={props.testID}>
      <View style={styles.divider} />
      {props.children}
    </View>
  );
}

export default GroupBodyRow;
