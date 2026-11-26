import { useState } from "react";
import { StyleSheet, View } from "react-native";

import Badge from "@components/Badge";
import CategoryTreePicker from "@components/CategoryTreePicker";
import { TreePickerLabels } from "@components/CategoryTreePicker/labels";
import {
  buildTreeRows,
  TreeNode,
} from "@components/CategoryTreePicker/treeModel";
import ChipGroup from "@components/ChipGroup";
import FieldShell from "@components/FieldShell";
import Icon from "@components/Icon";
import IconTile from "@components/IconTile";
import RemovableChip from "@components/RemovableChip";
import Text from "@components/Text";
import { getFrameStyle } from "@components/TextField/styles";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";
import { normalizeCategoryColor } from "@presentation/constants/categoryColors";

export type CategoryTreeFieldProps = {
  archivedLabel: string;
  contextLine?: string;
  disabled?: boolean;
  error?: string;
  helper?: string;
  label: string;
  labels: TreePickerLabels;
  /** Most used nodes shown as chips before "More…" (single mode, up to 6) */
  mostUsedIds?: string[];
  nodes: TreeNode[];
  onCreate?: (name: string) => void;
  pickerTitle?: string;
  placeholder?: string;
  testID: string;
} & (
  | { mode: "multiple"; onChange: (ids: string[]) => void; value: string[] }
  | { mode: "single"; onChange: (id?: string) => void; value?: string }
);

const MAX_CHIPS = 6;
const MORE_VALUE = "__more__";

function CategoryTreeField(props: CategoryTreeFieldProps) {
  const theme = useKitTheme();
  const { colors, spacing } = theme;
  const [open, setOpen] = useState(false);
  const { labels, testID } = props;
  const single = props.mode === "single";
  const rows = buildTreeRows(props.nodes);
  const selected = single
    ? props.nodes.find((item) => item.id === props.value)
    : undefined;
  const path = rows.find((row) => single && row.node.id === props.value)?.path;
  const styles = StyleSheet.create({
    ancestors: { color: colors.textSecondary },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
    frame: {
      ...getFrameStyle({
        disabled: props.disabled,
        error: !!props.error,
        theme,
      }),
      gap: spacing.sm,
      paddingHorizontal: spacing.sm,
    },
    text: { flex: 1, flexDirection: "row", flexWrap: "wrap" },
  });

  function chipOptions() {
    if (!single) {
      return [];
    }
    const ids = (props.mostUsedIds ?? []).filter((id) =>
      props.nodes.some((item) => item.id === id && !item.archived),
    );
    const shown =
      props.value && !ids.includes(props.value)
        ? [props.value, ...ids.slice(0, MAX_CHIPS - 1)]
        : ids.slice(0, MAX_CHIPS);

    return [
      ...shown.flatMap((id) => {
        const chipNode = props.nodes.find((item) => item.id === id);

        return chipNode
          ? [
              {
                colorDot: normalizeCategoryColor(chipNode.color),
                label: chipNode.name,
                value: id,
              },
            ]
          : [];
      }),
      { label: labels.more, value: MORE_VALUE, variant: "add" as const },
    ];
  }

  function onChip(value: string) {
    if (value === MORE_VALUE) {
      setOpen(true);
      return;
    }
    if (props.mode === "single") {
      props.onChange(value);
    }
  }

  function fieldText() {
    if (!selected || !path) {
      return (
        <Text.Body
          testID={`${testID}-value`}
          tone={"secondary"}
          value={
            single && props.value === undefined
              ? (labels.noneLabel ?? props.placeholder ?? "")
              : (props.placeholder ?? "")
          }
        />
      );
    }

    return (
      <View style={styles.text}>
        {path.length > 1 ? (
          <Text.Body
            testID={`${testID}-ancestors`}
            tone={"secondary"}
            value={`${path.slice(0, -1).join(" › ")} › `}
          />
        ) : null}
        <Text.Body testID={`${testID}-value`} value={selected.name} />
      </View>
    );
  }

  return (
    <FieldShell
      disabled={props.disabled}
      error={props.error}
      helper={props.helper}
      label={props.label}
      testID={`${testID}-shell`}
    >
      {single && (props.mostUsedIds?.length ?? 0) > 0 ? (
        <ChipGroup
          layout={"wrap"}
          mode={"single"}
          onChange={onChip}
          options={chipOptions()}
          testID={testID}
          value={props.value}
        />
      ) : null}
      <Touchable
        accessibilityLabel={
          selected && path ? `${props.label}, ${path.join(", ")}` : props.label
        }
        accessibilityRole="button"
        disabled={props.disabled}
        onPress={() => setOpen(true)}
        style={styles.frame}
        testID={`${testID}-field`}
      >
        {selected ? (
          <IconTile
            color={normalizeCategoryColor(selected.color)}
            name={selected.icon}
            size="sm"
          />
        ) : null}
        {fieldText()}
        {selected?.archived ? (
          <Badge label={props.archivedLabel} testID={`${testID}-archived`} />
        ) : null}
        <Icon
          color={colors.textSecondary}
          name="chevron-down"
          size={theme.sizes.iconMd}
        />
      </Touchable>
      {!single && props.value.length > 0 ? (
        <View style={styles.chips}>
          {props.value.map((id) => {
            const chipNode = props.nodes.find((item) => item.id === id);

            return chipNode ? (
              <RemovableChip
                dotColor={normalizeCategoryColor(chipNode.color)}
                key={id}
                label={chipNode.name}
                onRemove={() =>
                  props.mode === "multiple" &&
                  props.onChange(props.value.filter((item) => item !== id))
                }
                removeLabel={`${labels.clear} ${chipNode.name}`}
                testID={`${testID}-chip-${id}`}
              />
            ) : null;
          })}
        </View>
      ) : null}
      {open ? (
        <CategoryTreePicker
          {...(props.mode === "single"
            ? {
                mode: "single" as const,
                onChange: props.onChange,
                value: props.value,
              }
            : {
                mode: "multiple" as const,
                onChange: props.onChange,
                value: props.value,
              })}
          contextLine={props.contextLine}
          labels={labels}
          nodes={props.nodes}
          onClose={() => setOpen(false)}
          onCreate={props.onCreate}
          testID={`${testID}-picker`}
          title={props.pickerTitle ?? props.label}
        />
      ) : null}
    </FieldShell>
  );
}

export default CategoryTreeField;
