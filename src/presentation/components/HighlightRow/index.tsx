import { StyleSheet, View } from "react-native";

import Icon from "@components/Icon";
import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface HighlightRowProps {
  caption?: string;
  /** A leading icon, drawn in the warning colour (the favorite star, spec 094) */
  icon?: string;
  testID?: string;
  title: string;
  /** Tints the row: green for a positive value, red for a negative one */
  tone: "expense" | "income";
  value: string;
}

// A row that stands out from its neighbours: icon, title with a caption and a bold amount on a tinted background (spec 094).
function HighlightRow(props: HighlightRowProps) {
  const { colors, radius, sizes, spacing } = useKitTheme();
  const { testID } = props;
  const styles = StyleSheet.create({
    root: {
      alignItems: "center",
      backgroundColor:
        props.tone === "income" ? colors.incomeSoft : colors.expenseSoft,
      borderRadius: radius.md,
      flexDirection: "row",
      gap: spacing.sm,
      padding: spacing.sm,
    },
    titles: { flex: 1 },
  });

  return (
    <View
      accessibilityLabel={[props.title, props.caption, props.value]
        .filter(Boolean)
        .join(", ")}
      accessible
      style={styles.root}
      testID={testID}
    >
      {props.icon ? (
        <Icon
          color={colors.warning}
          name={props.icon}
          size={sizes.iconMd}
          testID={testID && `${testID}-icon`}
        />
      ) : null}
      <View style={styles.titles}>
        <Text.BodyStrong numberOfLines={1} value={props.title} />
        {props.caption ? (
          <Text.Caption tone="secondary" value={props.caption} />
        ) : null}
      </View>
      <Text.Heading tabular tone={props.tone} value={props.value} />
    </View>
  );
}

export default HighlightRow;
