import { ScrollView, StyleSheet, View } from "react-native";

import Chip, { ChipProps } from "@components/Chip";
import FieldShell from "@components/FieldShell";
import { useKitTheme } from "@components/utils/useKitTheme";

export type ChipGroupProps = {
  disabled?: boolean;
  error?: string;
  label?: string;
  layout?: "scroll" | "wrap";
  options: ChipOption[];
  testID?: string;
} & (
  | { mode: "multiple"; onChange: (value: string[]) => void; value: string[] }
  | { mode: "single"; onChange: (value: string) => void; value?: string }
);

export type ChipOption = Pick<
  ChipProps,
  "colorDot" | "count" | "icon" | "label" | "variant"
> & {
  value: string;
};

function ChipGroup(props: ChipGroupProps) {
  const { spacing } = useKitTheme();
  const { testID } = props;
  const styles = StyleSheet.create({
    row: {
      flexDirection: "row",
      flexWrap: props.layout === "scroll" ? "nowrap" : "wrap",
      gap: spacing.xs,
    },
  });

  function isSelected(value: string) {
    return props.mode === "single"
      ? props.value === value
      : props.value.includes(value);
  }

  function onPress(option: ChipOption) {
    if (props.mode === "single") {
      if (props.value !== option.value || option.variant === "add") {
        props.onChange(option.value);
      }
      return;
    }
    props.onChange(
      props.value.includes(option.value)
        ? props.value.filter((value) => value !== option.value)
        : [...props.value, option.value],
    );
  }

  const chips = props.options.map((option) => (
    <Chip
      colorDot={option.colorDot}
      count={option.count}
      disabled={props.disabled}
      icon={option.icon}
      key={option.value}
      label={option.label}
      onPress={() => onPress(option)}
      selected={isSelected(option.value)}
      testID={testID && `${testID}-${option.value}`}
      variant={option.variant}
    />
  ));

  return (
    <FieldShell error={props.error} label={props.label} testID={testID}>
      {props.layout === "scroll" ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          testID={testID && `${testID}-scroll`}
        >
          <View style={styles.row}>{chips}</View>
        </ScrollView>
      ) : (
        <View style={styles.row}>{chips}</View>
      )}
    </FieldShell>
  );
}

export default ChipGroup;
