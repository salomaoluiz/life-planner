import { useState } from "react";
import { StyleSheet, View } from "react-native";

import BottomSheet from "@components/BottomSheet";
import FieldShell from "@components/FieldShell";
import Icon from "@components/Icon";
import OptionRow from "@components/OptionRow";
import Text from "@components/Text";
import { getFrameStyle } from "@components/TextField/styles";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface InvoiceFieldOption {
  // A paid invoice does not receive purchases: shown, not pressable, with its reason as `subtitle`.
  disabled: boolean;
  // What the closed field shows once this option is selected.
  fieldLabel: string;
  statusLabel: string;
  statusTone: "income" | "neutral";
  subtitle: string;
  title: string;
  value: string;
}

export interface InvoiceFieldProps {
  closeLabel: string;
  // Shown under the field when the chosen invoice is not the one the date computes (spec 095 FR 14).
  hint?: { actionLabel: string; onAction: () => void; text: string };
  label: string;
  onChange: (month: string) => void;
  options: InvoiceFieldOption[];
  sheetTitle: string;
  testID: string;
  value: string;
}

// The invoice picker of a card purchase (spec 095): a select-like field whose sheet lists the previous,
// computed and next invoice with a status chip. Compact: bottom sheet; wide: centered dialog.
function InvoiceField(props: InvoiceFieldProps) {
  const theme = useKitTheme();
  const { colors, spacing } = theme;
  const [open, setOpen] = useState(false);
  const { testID } = props;
  const selected = props.options.find((option) => option.value === props.value);

  const styles = StyleSheet.create({
    frame: {
      ...getFrameStyle({ disabled: false, error: false, theme }),
      paddingHorizontal: spacing.sm,
    },
    hint: {
      alignItems: "center",
      columnGap: spacing.xs,
      flexDirection: "row",
      flexWrap: "wrap",
    },
    text: { flex: 1 },
  });

  return (
    <View>
      <FieldShell label={props.label} testID={testID}>
        <Touchable
          accessibilityLabel={`${props.label}, ${selected?.fieldLabel ?? props.value}`}
          accessibilityRole="button"
          onPress={() => setOpen(true)}
          style={styles.frame}
          testID={testID}
        >
          <View style={styles.text}>
            <Text.Body
              numberOfLines={1}
              testID={`${testID}-value`}
              tone={"primary"}
              value={selected?.fieldLabel ?? props.value}
            />
          </View>
          <Icon
            color={colors.textSecondary}
            name="chevron-down"
            size={theme.sizes.iconMd}
            testID={`${testID}-chevron`}
          />
        </Touchable>
      </FieldShell>
      {props.hint ? (
        <View style={styles.hint} testID={`${testID}-hint`}>
          <Text.Caption tone={"secondary"} value={props.hint.text} />
          <Touchable
            accessibilityLabel={props.hint.actionLabel}
            accessibilityRole="button"
            onPress={props.hint.onAction}
            testID={`${testID}-reset`}
          >
            <Text.Caption tone={"accent"} value={props.hint.actionLabel} />
          </Touchable>
        </View>
      ) : null}
      <BottomSheet
        closeLabel={props.closeLabel}
        onClose={() => setOpen(false)}
        testID={`${testID}-sheet`}
        title={props.sheetTitle}
        visible={open}
      >
        {props.options.map((option) => (
          <OptionRow
            accessibilityLabel={`${option.title}, ${option.statusLabel}`}
            active={option.value === props.value}
            badge={{ label: option.statusLabel, tone: option.statusTone }}
            disabled={option.disabled}
            key={option.value}
            onPress={() => {
              props.onChange(option.value);
              setOpen(false);
            }}
            subtitle={option.subtitle}
            testID={`${testID}-option-${option.value}`}
            title={option.title}
          />
        ))}
      </BottomSheet>
    </View>
  );
}

export default InvoiceField;
