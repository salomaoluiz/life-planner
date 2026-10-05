import { useState } from "react";
import { StyleSheet, View } from "react-native";

import BottomSheet from "@components/BottomSheet";
import FieldShell from "@components/FieldShell";
import Icon from "@components/Icon";
import ListItem from "@components/ListItem";
import SearchField from "@components/SearchField";
import Text from "@components/Text";
import { getFrameStyle } from "@components/TextField/styles";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface SelectFieldProps {
  closeLabel: string;
  disabled?: boolean;
  error?: string;
  helper?: string;
  label: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchClearLabel?: string;
  searchPlaceholder?: string;
  sheetTitle: string;
  testID?: string;
  value?: string;
}

export interface SelectOption {
  description?: string;
  label: string;
  leading?: React.ReactNode;
  value: string;
}

const SEARCH_THRESHOLD = 8;

function SelectField(props: SelectFieldProps) {
  const theme = useKitTheme();
  const { colors, spacing } = theme;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const { testID } = props;

  const selected = props.options.find((option) => option.value === props.value);
  const showSearch = props.options.length > SEARCH_THRESHOLD;
  const needle = query.trim().toLowerCase();
  const visible = needle
    ? props.options.filter((option) =>
        option.label.toLowerCase().includes(needle),
      )
    : props.options;
  const accessibilityLabel = selected
    ? `${props.label}, ${selected.label}`
    : props.label;

  const styles = StyleSheet.create({
    frame: {
      ...getFrameStyle({
        disabled: props.disabled,
        error: !!props.error,
        theme,
      }),
      paddingHorizontal: spacing.sm,
    },
    text: { flex: 1 },
  });

  function close() {
    setOpen(false);
    setQuery("");
  }

  return (
    <FieldShell
      disabled={props.disabled}
      error={props.error}
      helper={props.helper}
      label={props.label}
      testID={testID}
    >
      <Touchable
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="button"
        disabled={props.disabled}
        onPress={() => setOpen(true)}
        style={styles.frame}
        testID={testID}
      >
        <View style={styles.text}>
          <Text.Body
            numberOfLines={1}
            testID={testID && `${testID}-value`}
            tone={selected ? "primary" : "secondary"}
            value={selected?.label ?? props.placeholder ?? ""}
          />
        </View>
        <Icon
          color={colors.textSecondary}
          name="chevron-down"
          size={theme.sizes.iconMd}
          testID={testID && `${testID}-chevron`}
        />
      </Touchable>
      <BottomSheet
        closeLabel={props.closeLabel}
        onClose={close}
        testID={testID && `${testID}-sheet`}
        title={props.sheetTitle}
        visible={open}
      >
        {showSearch ? (
          <SearchField
            clearLabel={props.searchClearLabel ?? props.closeLabel}
            onChangeText={setQuery}
            placeholder={props.searchPlaceholder ?? props.sheetTitle}
            testID={testID && `${testID}-search`}
            value={query}
          />
        ) : null}
        {visible.map((option) => (
          <ListItem
            key={option.value}
            leading={option.leading}
            onPress={() => {
              props.onChange(option.value);
              close();
            }}
            selected={option.value === props.value}
            subtitle={option.description}
            testID={testID && `${testID}-option-${option.value}`}
            title={option.label}
            trailing={
              option.value === props.value ? (
                <Icon
                  color={colors.accent}
                  name="check"
                  size={theme.sizes.iconMd}
                />
              ) : undefined
            }
          />
        ))}
      </BottomSheet>
    </FieldShell>
  );
}

export default SelectField;
