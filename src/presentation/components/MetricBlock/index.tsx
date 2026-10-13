import { StyleSheet, View } from "react-native";

import Icon from "@components/Icon";
import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface MetricBlockProps {
  label: string;
  testID?: string;
  trend?: "expense" | "income";
  value: React.ReactNode;
}

function MetricBlock(props: MetricBlockProps) {
  const { colors, radius, sizes, spacing } = useKitTheme();
  const { testID } = props;
  const styles = StyleSheet.create({
    header: { alignItems: "center", flexDirection: "row", gap: spacing.xxs },
    root: {
      backgroundColor: colors.surfaceRaised,
      borderRadius: radius.md,
      flex: 1,
      gap: spacing.xxs,
      padding: spacing.sm,
    },
  });

  return (
    <View style={styles.root} testID={testID}>
      <View style={styles.header}>
        {props.trend ? (
          <Icon
            color={props.trend === "income" ? colors.income : colors.expense}
            name={
              props.trend === "income"
                ? "arrow-top-right"
                : "arrow-bottom-right"
            }
            size={sizes.iconSm}
            testID={testID && `${testID}-trend`}
          />
        ) : null}
        <Text.Caption
          numberOfLines={1}
          testID={testID && `${testID}-label`}
          value={props.label}
        />
      </View>
      {typeof props.value === "string" ? (
        <Text.BodyStrong tabular value={props.value} />
      ) : (
        props.value
      )}
    </View>
  );
}

export default MetricBlock;
