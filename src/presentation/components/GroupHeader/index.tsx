import { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface GroupHeaderProps {
  testID?: string;
  title: string;
  trailing?: ReactNode;
}

function GroupHeader(props: GroupHeaderProps) {
  const { colors, spacing } = useKitTheme();
  const styles = StyleSheet.create({
    container: {
      alignItems: "center",
      backgroundColor: colors.background,
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: spacing.xs,
    },
  });

  return (
    <View
      accessibilityRole="header"
      style={styles.container}
      testID={props.testID}
    >
      <Text.Overline value={props.title} />
      {props.trailing}
    </View>
  );
}

export default GroupHeader;
