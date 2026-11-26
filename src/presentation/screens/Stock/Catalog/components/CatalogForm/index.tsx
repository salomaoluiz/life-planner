import { View } from "react-native";

import {
  BottomSheet,
  Button,
  CategoryTreeField,
  ColorSwatchGroup,
  FormColumns,
  IconTile,
  SwitchRow,
  Text,
  TextField,
  useTreePickerLabels,
} from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import CustomColorSheet from "@screens/Financial/Categories/modals/NewCategoryModal/components/CustomColorSheet";
import useCatalogFormViewModel, {
  CatalogFormProps,
} from "@screens/Stock/Catalog/hooks/useCatalogFormViewModel";
import stockCatalogTestIds from "@screens/Stock/Catalog/testIds";
import LocationQrPanel from "@screens/Stock/containers/LocationQrPanel";

import StockIconPicker from "../StockIconPicker";

// Spec 125 FR 6-9: two columns on web/tablet ("Dados" | "Aparência", location: + "QR deste local"), a single
// bottom sheet on mobile (the sheet layout does the switch).
function CatalogForm(props: CatalogFormProps) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const vm = useCatalogFormViewModel(props);
  const isCategory = props.kind === "category";
  const parentLabels = useTreePickerLabels(
    isCategory ? "category" : "location",
  );
  const financeLabels = useTreePickerLabels("category");
  const isEditing = !!vm.existing;

  function title() {
    if (isCategory) {
      return t(
        isEditing
          ? "stock.catalog.form.editCategory"
          : "stock.catalog.form.newCategory",
      );
    }

    return t(
      isEditing
        ? "stock.catalog.form.editLocation"
        : "stock.catalog.form.newLocation",
    );
  }

  const noParentLabel = t(
    isCategory
      ? "stock.catalog.form.noParentCategory"
      : "stock.catalog.form.noParentLocation",
  );
  const financeHelper = financeText();

  function financeText() {
    if (vm.financeId) {
      return undefined;
    }

    const inherited = vm.financeOptions.find(
      (option) => option.value === vm.inheritedFinance,
    );

    if (vm.parent && inherited) {
      return t("stock.catalog.form.financeInherits", {
        category: inherited.label,
        parent: vm.parent.name,
      });
    }

    return t("stock.catalog.form.financeListDefault");
  }

  const dataFields = (
    <View style={{ gap: spacing.md }}>
      <TextField
        error={
          vm.nameTaken
            ? t("stock.catalog.form.nameTaken", { name: vm.name.trim() })
            : undefined
        }
        label={t("stock.catalog.form.name")}
        maxLength={50}
        onChangeText={vm.onNameChange}
        testID={stockCatalogTestIds.nameInput}
        value={vm.name}
      />
      <CategoryTreeField
        archivedLabel={t("common.treePicker.archived")}
        label={t("stock.catalog.form.parent")}
        labels={{ ...parentLabels, noneLabel: noParentLabel }}
        mode={"single"}
        nodes={vm.parentNodes}
        onChange={(id) => vm.onParentChange(id ?? "")}
        testID={stockCatalogTestIds.parentSelect}
        value={vm.parentId || undefined}
      />
      {isCategory ? (
        <CategoryTreeField
          archivedLabel={t("common.treePicker.archived")}
          helper={financeHelper}
          label={t("stock.catalog.form.finance")}
          labels={{
            ...financeLabels,
            noneLabel: t(
              vm.parent
                ? "stock.catalog.form.financeInherit"
                : "stock.catalog.form.financeDefault",
            ),
          }}
          mode={"single"}
          nodes={vm.financeNodes}
          onChange={(id) => vm.onFinanceChange(id ?? "")}
          testID={stockCatalogTestIds.financeSelect}
          value={vm.financeId || undefined}
        />
      ) : null}
      {vm.canAddChild ? (
        <Button.Ghost
          inline
          label={t(
            isCategory
              ? "stock.catalog.form.newChildCategory"
              : "stock.catalog.form.newChildLocation",
          )}
          onPress={() => props.onAddChild(vm.existing?.id as string)}
          testID={stockCatalogTestIds.addChild}
        />
      ) : null}
      {vm.existing ? (
        <Button.Ghost
          inline
          label={t("stock.catalog.form.viewItems", {
            count: vm.existing.itemCount,
          })}
          onPress={() => props.onViewItems((vm.existing?.id ?? "") as string)}
          testID={stockCatalogTestIds.viewItems}
        />
      ) : null}
      {vm.ruleError ? (
        <Text.Caption tone={"secondary"} value={t("stock.catalog.form.rule")} />
      ) : null}
    </View>
  );

  const shades = vm.parent
    ? vm.colorOptions.shades.map((value) => ({ label: value, value }))
    : [];
  const swatches = vm.colorOptions.base.map((item) => ({
    label: t(item.labelKey),
    value: item.value,
  }));

  const appearanceFields = (
    <View style={{ gap: spacing.md }}>
      <View
        style={{ alignItems: "center", flexDirection: "row", gap: spacing.sm }}
      >
        <IconTile
          color={vm.iconColor}
          name={vm.icon}
          size={"lg"}
          testID={stockCatalogTestIds.preview}
        />
        <Button.Secondary
          label={t("stock.catalog.form.iconPick")}
          onPress={vm.onIconOpen}
          testID={stockCatalogTestIds.iconButton}
        />
      </View>
      {shades.length > 0 ? (
        <ColorSwatchGroup
          label={t("stock.catalog.form.shades", {
            parent: vm.parent?.name ?? "",
          })}
          onChange={vm.onColorChange}
          options={shades}
          testID={stockCatalogTestIds.shades}
          value={vm.iconColor}
        />
      ) : null}
      <ColorSwatchGroup
        customLabel={t("stock.catalog.form.otherColor")}
        label={t("stock.catalog.form.color")}
        onChange={vm.onColorChange}
        onCustomPress={vm.onCustomOpen}
        options={swatches}
        testID={stockCatalogTestIds.colors}
        value={vm.iconColor}
      />
      {vm.hasDescendants ? (
        <SwitchRow
          label={t(
            isCategory
              ? "stock.catalog.form.applyToChildren"
              : "stock.catalog.form.applyToSublocations",
          )}
          onToggle={vm.onApplyToggle}
          testID={stockCatalogTestIds.applyToChildren}
          value={vm.applyToChildren}
        />
      ) : null}
    </View>
  );

  const qr = (
    <View style={{ gap: spacing.sm }}>
      <Text.BodyStrong value={t("stock.catalog.form.qrTitle")} />
      {vm.existing ? (
        <LocationQrPanel
          location={{ id: vm.existing.id, name: vm.existing.name }}
        />
      ) : (
        <Text.Caption
          tone={"secondary"}
          value={t("stock.catalog.form.qrSaveFirst")}
        />
      )}
    </View>
  );

  const left = isCategory ? (
    <View style={{ gap: spacing.lg }}>
      <Text.BodyStrong value={t("stock.catalog.form.data")} />
      {dataFields}
    </View>
  ) : (
    <View style={{ gap: spacing.lg }}>
      <Text.BodyStrong value={t("stock.catalog.form.data")} />
      {dataFields}
      <Text.BodyStrong value={t("stock.catalog.form.appearance")} />
      {appearanceFields}
    </View>
  );
  const right = isCategory ? (
    <View style={{ gap: spacing.lg }}>
      <Text.BodyStrong value={t("stock.catalog.form.appearance")} />
      {appearanceFields}
    </View>
  ) : (
    qr
  );

  return (
    <>
      <BottomSheet
        closeLabel={t("common.actions.close")}
        footer={
          <Button.Primary
            disabled={!vm.name.trim() || vm.isSaving}
            label={t("stock.catalog.form.save")}
            loading={vm.isSaving}
            onPress={vm.onSave}
            testID={stockCatalogTestIds.saveButton}
          />
        }
        footerSecondary={
          <Button.Secondary
            label={t("stock.catalog.form.cancel")}
            onPress={props.onClose}
            testID={stockCatalogTestIds.cancelButton}
          />
        }
        footerStart={
          isEditing ? (
            <View style={{ flexDirection: "row", gap: spacing.xs }}>
              <Button.Destructive
                label={t("stock.catalog.form.delete")}
                onPress={() => props.onDelete(vm.existing?.id as string)}
                testID={stockCatalogTestIds.deleteButton}
              />
              <Button.Secondary
                label={t(
                  vm.isArchived
                    ? "stock.catalog.form.reactivate"
                    : "stock.catalog.form.archive",
                )}
                onPress={vm.onToggleArchive}
                testID={stockCatalogTestIds.archiveButton}
              />
            </View>
          ) : undefined
        }
        onClose={props.onClose}
        size={"form"}
        subtitle={
          vm.existing
            ? t(pluralKey("stock.catalog.itemCount", vm.existing.itemCount), {
                count: vm.existing.itemCount,
              })
            : undefined
        }
        testID={stockCatalogTestIds.sheet}
        title={title()}
        visible
      >
        <FormColumns left={left} right={right} />
      </BottomSheet>
      {vm.iconOpen ? (
        <StockIconPicker
          onClose={vm.onIconClose}
          onSelect={vm.onIconChange}
          selected={vm.icon}
        />
      ) : null}
      {vm.customOpen ? (
        <CustomColorSheet
          applyLabel={t("stock.catalog.form.save")}
          closeLabel={t("common.actions.close")}
          color={vm.iconColor}
          error={vm.customError}
          hexLabel={t("stock.catalog.form.otherColor")}
          onApply={vm.onCustomApply}
          onChange={vm.onCustomDraftChange}
          onClose={vm.onCustomClose}
          title={t("stock.catalog.form.otherColor")}
          value={vm.customDraft}
        />
      ) : null}
    </>
  );
}

export default CatalogForm;
