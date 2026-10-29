import { StyleSheet, View } from "react-native";

import Text from "@components/Text";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface OptionRowProps {
  accessibilityLabel: string;
  // The keyboard highlight.
  active?: boolean;
  badge?: { label: string; tone: "expense" | "income" | "neutral" };
  // A color bullet before the title.
  bullet?: string;
  disabled?: boolean;
  muted?: boolean;
  onPress: () => void;
  subtitle?: string;
  testID?: string;
  title: string;
  // A fixed-color bullet at the opposite end: expense or income.
  typeDot?: "expense" | "income";
}

const BULLET = 10;
const MIN_HEIGHT = 48;

// A search result: color bullet, title, optional second line and a type badge (spec 051 FR 4).
function OptionRow(props: OptionRowProps) {
  const { colors, radius, spacing } = useKitTheme();
  const tones = {
    expense: { background: colors.expenseSoft, text: colors.expense },
    income: { background: colors.incomeSoft, text: colors.income },
    neutral: { background: colors.surfaceRaised, text: colors.textSecondary },
  };
  const tone = props.badge ? tones[props.badge.tone] : undefined;
  const styles = StyleSheet.create({
    badge: {
      backgroundColor: tone?.background,
      borderRadius: radius.full,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xxs,
    },
    bullet: {
      backgroundColor: props.bullet ?? colors.border,
      borderRadius: radius.full,
      height: BULLET,
      width: BULLET,
    },
    root: {
      alignItems: "center",
      backgroundColor: props.active ? colors.surfaceRaised : undefined,
      borderRadius: radius.sm,
      flexDirection: "row",
      gap: spacing.sm,
      minHeight: MIN_HEIGHT,
      opacity: props.muted || props.disabled ? 0.6 : 1,
      padding: spacing.sm,
    },
    text: { flex: 1 },
    typeDot: {
      backgroundColor: props.typeDot ? colors[props.typeDot] : undefined,
      borderRadius: radius.full,
      height: BULLET,
      width: BULLET,
    },
  });

  return (
    <Touchable
      accessibilityLabel={props.accessibilityLabel}
      accessibilityRole="button"
      disabled={props.disabled}
      minTouchTarget={false}
      onPress={props.onPress}
      selected={props.active}
      style={styles.root}
      testID={props.testID}
    >
      <View style={styles.bullet} />
      <View style={styles.text}>
        <Text.BodyStrong numberOfLines={1} value={props.title} />
        {props.subtitle ? (
          <Text.Caption
            numberOfLines={1}
            tone={"secondary"}
            value={props.subtitle}
          />
        ) : null}
      </View>
      {props.badge && tone ? (
        <View style={styles.badge}>
          <Text.Caption color={tone.text} value={props.badge.label} />
        </View>
      ) : null}
      {props.typeDot ? (
        <View
          accessibilityElementsHidden
          style={styles.typeDot}
          testID={props.testID && `${props.testID}-type-dot`}
        />
      ) : null}
    </Touchable>
  );
}

export default OptionRow;
