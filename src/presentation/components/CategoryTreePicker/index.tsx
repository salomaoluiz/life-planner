import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

import Badge from "@components/Badge";
import BottomSheet from "@components/BottomSheet";
import Button from "@components/Button";
import EmptyState from "@components/EmptyState";
import Icon from "@components/Icon";
import IconTile from "@components/IconTile";
import RemovableChip from "@components/RemovableChip";
import SearchField from "@components/SearchField";
import Text from "@components/Text";
import TreeItem from "@components/TreeItem";
import { useKitTheme } from "@components/utils/useKitTheme";
import { normalizeCategoryColor } from "@presentation/constants/categoryColors";

import { TreePickerLabels } from "./labels";
import {
  buildTreeRows,
  columnSplit,
  filterTreeByQuery,
  TreeNode,
  TreeRow,
  visibleNodes,
} from "./treeModel";

export type CategoryTreePickerProps = {
  contextLine?: string;
  labels: TreePickerLabels;
  nodes: TreeNode[];
  onClose: () => void;
  /** Opens the create modal of the list with the search text as the name (spec 126 FR 17) */
  onCreate?: (name: string) => void;
  testID: string;
  title: string;
} & (
  | { mode: "multiple"; onChange: (ids: string[]) => void; value: string[] }
  | { mode: "single"; onChange: (id?: string) => void; value?: string }
);

function CategoryTreePicker(props: CategoryTreePickerProps) {
  const { breakpoint, colors, radius, sizes, spacing } = useKitTheme();
  const wide = breakpoint !== "compact";
  const { labels, testID } = props;
  const [query, setQuery] = useState("");
  const [draft, setDraft] = useState<string[]>(
    props.mode === "multiple" ? props.value : [],
  );
  const searching = query.trim() !== "";
  const nodes = useMemo(() => visibleNodes(props.nodes), [props.nodes]);
  const byId = useMemo(
    () => new Map(nodes.map((item) => [item.id, item])),
    [nodes],
  );
  const rows = useMemo(
    () => buildTreeRows(filterTreeByQuery(nodes, query)),
    [nodes, query],
  );
  const styles = StyleSheet.create({
    box: {
      alignItems: "center",
      borderRadius: radius.sm,
      borderWidth: 2,
      height: 22,
      justifyContent: "center",
      width: 22,
    },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: spacing.xs },
    column: { flex: 1, minWidth: 0 },
    columns: { flexDirection: "row", gap: spacing.xl },
    footer: { flexDirection: "row", gap: spacing.sm },
    none: { alignItems: "center", flexDirection: "row" },
  });

  function ancestorIdsOf(id: string) {
    const result: string[] = [];
    const seen = new Set([id]);
    let parent = byId.get(id)?.parentId;

    while (parent && byId.has(parent) && !seen.has(parent)) {
      seen.add(parent);
      result.push(parent);
      parent = byId.get(parent)?.parentId;
    }

    return result;
  }

  function coveredBy(id: string) {
    const ancestor = ancestorIdsOf(id).find((item) => draft.includes(item));

    return ancestor ? byId.get(ancestor)?.name : undefined;
  }

  function pick(id: string) {
    if (props.mode === "single") {
      props.onChange(id);
      props.onClose();
      return;
    }
    if (coveredBy(id)) {
      return;
    }
    setDraft((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function apply() {
    if (props.mode === "multiple") {
      props.onChange(draft);
    }
    props.onClose();
  }

  function boxBackground(ticked: boolean, covered: boolean) {
    if (ticked) {
      return colors.accent;
    }

    return covered ? colors.accentSoft : colors.surface;
  }

  function selectedMark(row: TreeRow) {
    const { id } = row.node;
    const covered = props.mode === "multiple" && !!coveredBy(id);
    const ticked = props.mode === "multiple" && draft.includes(id);

    if (props.mode === "single") {
      return props.value === id ? (
        <Icon
          color={colors.accent}
          name="check"
          size={sizes.iconMd}
          testID={`${testID}-option-${id}-selected`}
        />
      ) : undefined;
    }

    return (
      <View
        style={[
          styles.box,
          {
            backgroundColor: boxBackground(ticked, covered),
            borderColor:
              ticked || covered ? colors.accent : colors.textSecondary,
          },
        ]}
        testID={`${testID}-option-${id}-box`}
      >
        {ticked || covered ? (
          <Icon
            color={ticked ? colors.surface : colors.textPrimary}
            name="check"
            size={sizes.iconSm}
          />
        ) : null}
      </View>
    );
  }

  function renderRow(row: TreeRow) {
    const { node } = row;
    const covered = props.mode === "multiple" ? coveredBy(node.id) : undefined;
    const single = props.mode === "single";

    return (
      <TreeItem
        depth={row.depth}
        key={node.id}
        leading={
          <>
            {single ? null : selectedMark(row)}
            <IconTile
              color={normalizeCategoryColor(node.color)}
              name={node.icon}
              size="sm"
            />
          </>
        }
        onPress={() => pick(node.id)}
        selected={single ? props.value === node.id : draft.includes(node.id)}
        subtitle={covered ? labels.includedIn(covered) : undefined}
        testID={`${testID}-option-${node.id}`}
        title={node.name}
        trailing={
          <>
            {node.badge ? (
              <Badge
                label={node.badge}
                testID={`${testID}-option-${node.id}-badge`}
              />
            ) : null}
            {single ? selectedMark(row) : null}
          </>
        }
      />
    );
  }

  function renderTree() {
    if (rows.length === 0 && searching) {
      return (
        <EmptyState
          actionLabel={
            props.onCreate ? labels.createNamed(query.trim()) : undefined
          }
          message={labels.emptyHint}
          onAction={() => props.onCreate?.(query.trim())}
          testID={`${testID}-empty`}
          title={labels.empty}
        />
      );
    }
    if (wide && rows.length > 1) {
      const [left, right] = columnSplit(rows);

      return (
        <View style={styles.columns}>
          <View style={styles.column}>{left.map(renderRow)}</View>
          <View style={styles.column}>{right.map(renderRow)}</View>
        </View>
      );
    }

    return <View>{rows.map(renderRow)}</View>;
  }

  const multiple = props.mode === "multiple";

  return (
    <BottomSheet
      closeLabel={labels.close}
      footer={
        multiple ? (
          <Button.Primary
            label={labels.apply(draft.length)}
            onPress={apply}
            testID={`${testID}-apply`}
          />
        ) : undefined
      }
      footerStart={
        multiple ? (
          <Button.Secondary
            label={labels.clear}
            onPress={() => setDraft([])}
            testID={`${testID}-clear`}
          />
        ) : undefined
      }
      onClose={props.onClose}
      size={"wizard"}
      subtitle={props.contextLine}
      testID={testID}
      title={props.title}
      visible
    >
      <SearchField
        clearLabel={labels.clear}
        onChangeText={setQuery}
        placeholder={labels.searchPlaceholder}
        testID={`${testID}-search`}
        value={query}
      />
      {multiple && draft.length > 0 ? (
        <View style={styles.chips}>
          {draft.map((id) => {
            const chipNode = byId.get(id);

            return chipNode ? (
              <RemovableChip
                dotColor={normalizeCategoryColor(chipNode.color)}
                key={id}
                label={chipNode.name}
                onRemove={() =>
                  setDraft((current) => current.filter((item) => item !== id))
                }
                removeLabel={`${labels.clear} ${chipNode.name}`}
                testID={`${testID}-chip-${id}`}
              />
            ) : null;
          })}
        </View>
      ) : null}
      {searching ? (
        <Text.Caption
          accessibilityLiveRegion={"polite"}
          testID={`${testID}-results`}
          value={labels.results(rows.length)}
        />
      ) : null}
      <ScrollView
        keyboardShouldPersistTaps={"handled"}
        showsVerticalScrollIndicator={false}
      >
        {props.mode === "single" && labels.noneLabel && !searching ? (
          <TreeItem
            depth={0}
            leading={<IconTile name={"close-circle-outline"} size="sm" />}
            onPress={() => {
              props.onChange(undefined);
              props.onClose();
            }}
            selected={props.value === undefined}
            testID={`${testID}-none`}
            title={labels.noneLabel}
          />
        ) : null}
        {renderTree()}
        {props.onCreate && !(rows.length === 0 && searching) ? (
          <Button.Secondary
            label={labels.newLabel}
            onPress={() => props.onCreate?.(query.trim())}
            testID={`${testID}-create`}
          />
        ) : null}
      </ScrollView>
    </BottomSheet>
  );
}

export type { TreeNode } from "./treeModel";
export default CategoryTreePicker;
