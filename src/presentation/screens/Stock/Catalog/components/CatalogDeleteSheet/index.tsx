import { useState } from "react";
import { View } from "react-native";

import {
  BottomSheet,
  Button,
  ConfirmDialog,
  RadioGroup,
  SelectField,
  Text,
} from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { ParentOption } from "@screens/Stock/Catalog/models/catalogParents";
import stockCatalogTestIds from "@screens/Stock/Catalog/testIds";

interface Props {
  busy: boolean;
  hasChildren: boolean;
  itemCount: number;
  kind: "category" | "location";
  name: string;
  onCancel: () => void;
  // `undefined` = nothing uses it; "none" = leave the items without one; else the id they move to.
  onConfirm: (moveTo?: string) => void;
  parentId?: string;
  targets: ParentOption[];
}

const MOVE = "move";
const LEAVE = "leave";

// Spec 125 FR 20-23: delete with no items is a plain confirmation; with items it asks where they go.
function CatalogDeleteSheet(props: Props) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const defaultTarget = props.targets.find(
    (target) => target.value === props.parentId,
  )?.value;
  const [choice, setChoice] = useState(MOVE);
  const [target, setTarget] = useState<string | undefined>(defaultTarget);
  const leaveLabel =
    props.kind === "category"
      ? t("stock.catalog.delete.leaveWithoutCategory")
      : t("stock.catalog.delete.leaveWithoutLocation");
  const title = t("stock.catalog.delete.title", { name: props.name });
  const subtree = props.hasChildren
    ? t("stock.catalog.delete.subtreeNote")
    : "";

  if (props.itemCount === 0) {
    return (
      <ConfirmDialog
        cancelLabel={t("stock.catalog.form.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("stock.catalog.delete.confirmDelete")}
        loading={props.busy}
        message={subtree}
        onCancel={props.onCancel}
        onConfirm={() => props.onConfirm(undefined)}
        testID={stockCatalogTestIds.deleteSheet}
        title={title}
        visible
      />
    );
  }

  const moving = choice === MOVE;
  let confirmLabel = t(
    props.kind === "category"
      ? "stock.catalog.delete.confirmLeaveCategory"
      : "stock.catalog.delete.confirmLeaveLocation",
  );

  if (moving) {
    confirmLabel = t(
      pluralKey("stock.catalog.delete.confirmMove", props.itemCount),
      { count: props.itemCount },
    );
  }

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        <Button.Primary
          disabled={props.busy || (moving && !target)}
          fullWidth
          label={confirmLabel}
          loading={props.busy}
          onPress={() => props.onConfirm(moving ? target : "none")}
          testID={stockCatalogTestIds.deleteConfirm}
        />
      }
      onClose={props.onCancel}
      testID={stockCatalogTestIds.deleteSheet}
      title={title}
      visible
    >
      <View style={{ gap: spacing.md }}>
        <Text.Body
          value={t(pluralKey("stock.catalog.delete.inUse", props.itemCount), {
            count: props.itemCount,
            name: props.name,
          })}
        />
        {subtree ? <Text.Caption tone={"secondary"} value={subtree} /> : null}
        <RadioGroup
          accessibilityLabel={t("stock.catalog.delete.moveTo")}
          onChange={setChoice}
          options={[
            {
              disabled: props.targets.length === 0,
              label: t("stock.catalog.delete.moveTo"),
              value: MOVE,
            },
            { label: leaveLabel, value: LEAVE },
          ]}
          testID={stockCatalogTestIds.deleteChoice}
          value={choice}
        />
        {moving ? (
          <SelectField
            closeLabel={t("common.actions.close")}
            label={t("stock.catalog.delete.moveTo")}
            onChange={setTarget}
            options={props.targets}
            placeholder={t("stock.catalog.delete.moveToPlaceholder")}
            sheetTitle={t("stock.catalog.delete.moveTo")}
            testID={stockCatalogTestIds.deleteTarget}
            value={target}
          />
        ) : null}
        <Text.Caption
          tone={"secondary"}
          value={t("stock.catalog.delete.archiveHint")}
        />
      </View>
    </BottomSheet>
  );
}

export default CatalogDeleteSheet;
