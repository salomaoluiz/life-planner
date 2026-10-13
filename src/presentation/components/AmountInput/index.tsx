import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";

import { formatAmount, parseCents } from "@components/AmountText/formatAmount";
import FieldShell from "@components/FieldShell";
import FocusRing from "@components/FocusRing";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useLocaleTag } from "@presentation/i18n";

export interface AmountInputProps {
  error?: string;
  label: string;
  onChange: (cents: number) => void;
  testID?: string;
  tone?: "expense" | "income" | "neutral";
  value: number;
}

function AmountInput(props: AmountInputProps) {
  const { colors, radius, spacing, typography } = useKitTheme();
  const localeTag = useLocaleTag();
  const [focused, setFocused] = useState(false);
  const display = formatAmount(props.value, localeTag);
  const color = {
    expense: colors.expense,
    income: colors.income,
    neutral: colors.textPrimary,
  }[props.tone ?? "neutral"];
  const styles = StyleSheet.create({
    input: {
      ...typography.display,
      color,
      fontVariant: ["tabular-nums"],
      paddingVertical: spacing.sm,
      textAlign: "center",
    },
  });

  return (
    <FieldShell error={props.error} label={props.label} testID={props.testID}>
      <View>
        <TextInput
          accessibilityHint={props.error}
          accessibilityLabel={props.label}
          keyboardType="number-pad"
          onBlur={() => setFocused(false)}
          onChangeText={(text) => props.onChange(parseCents(text))}
          onFocus={() => setFocused(true)}
          selection={{ end: display.length, start: display.length }}
          style={styles.input}
          testID={props.testID}
          value={display}
        />
        <FocusRing radius={radius.md} visible={focused} />
      </View>
    </FieldShell>
  );
}

export default AmountInput;
