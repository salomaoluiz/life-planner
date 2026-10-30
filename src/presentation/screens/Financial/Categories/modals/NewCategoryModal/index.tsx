import { View } from "react-native";

import {
  BottomSheet,
  Button,
  Card,
  ChipGroup,
  ColorSwatchGroup,
  ConfirmDialog,
  ErrorState,
  FormColumns,
  IconChoiceGroup,
  IconTile,
  PendingItemsDialog,
  SegmentedControl,
  SelectField,
  Text,
  TextField,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { TranslationKeys } from "@presentation/i18n/types";
import { useBreakpoint } from "@presentation/theme";
import { translateChoices } from "@screens/Financial/models/ownerOptions";

import ApplyToSubcategories from "./components/ApplyToSubcategories";
import CustomColorSheet from "./components/CustomColorSheet";
import IconPickerSheet from "./components/IconPickerSheet";
import { useNewCategoryViewModel } from "./hooks";
import useStyles from "./styles";
import categoryFormTestIds from "./testIds";

const SKELETON_ROWS = [0, 1, 2];

function NewCategoryModal() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useNewCategoryViewModel();
  const breakpoint = useBreakpoint();

  function err(key?: TranslationKeys) {
    return key ? t(key) : undefined;
  }

  function renderBody() {
    if (vm.isNotFound) {
      return (
        <ErrorState
          message={t("financial.errors.notFound")}
          onRetry={vm.onClose}
          retryLabel={t("common.actions.close")}
        />
      );
    }

    if (vm.isLoading) {
      return (
        <View>
          {SKELETON_ROWS.map((row) => (
            <Skeleton.ListItem key={row} testID={"category-form-skeleton"} />
          ))}
        </View>
      );
    }

    return (
      <View style={styles.form}>
        <FormColumns
          left={
            <>
              <View style={styles.preview}>
                <IconTile color={vm.iconColor} name={vm.icon} size={"lg"} />
                <Text.Heading
                  testID={categoryFormTestIds.namePreview}
                  tone={vm.name ? "primary" : "secondary"}
                  value={
                    vm.name || t("financial.categories.form.namePlaceholder")
                  }
                />
              </View>
              <TextField
                error={err(vm.nameError)}
                label={t("financial.categories.form.name")}
                maxLength={80}
                onChangeText={vm.onNameChange}
                placeholder={t("financial.categories.form.namePlaceholder")}
                testID={categoryFormTestIds.nameInput}
                value={vm.name}
              />
              <View style={styles.helper}>
                <SegmentedControl
                  accessibilityLabel={t("financial.categories.form.type")}
                  disabled={vm.isTypeLocked}
                  onChange={vm.onTypeChange}
                  options={vm.typeOptions.map((option) => ({
                    label: t(option.labelKey),
                    tone: option.value === "EXPENSE" ? "expense" : "income",
                    value: option.value,
                  }))}
                  testID={categoryFormTestIds.type}
                  value={vm.type}
                />
                {vm.typeHelperKey && (
                  <Text.Caption
                    tone={"secondary"}
                    value={t(vm.typeHelperKey)}
                  />
                )}
              </View>
              <SelectField
                closeLabel={t("common.actions.close")}
                label={t("financial.categories.form.parent")}
                onChange={vm.onParentChange}
                options={[
                  { label: t("financial.categories.form.noParent"), value: "" },
                  ...vm.parentOptions.map((option) => ({
                    label: `${"– ".repeat(option.depth)}${option.label}`,
                    value: option.value,
                  })),
                ]}
                sheetTitle={t("financial.categories.form.parent")}
                testID={categoryFormTestIds.parentSelect}
                value={vm.parentId}
              />
              {vm.parentHelperKey && (
                <Text.Caption
                  tone={"secondary"}
                  value={t(vm.parentHelperKey)}
                />
              )}
            </>
          }
          right={
            <>
              <ColorSwatchGroup
                customLabel={t("financial.categories.form.customColor")}
                label={t("financial.categories.form.color")}
                onChange={vm.onColorChange}
                onCustomPress={vm.onCustomColorOpen}
                options={vm.colorOptions.map((option) => ({
                  label: t(option.labelKey),
                  value: option.value,
                }))}
                testID={categoryFormTestIds.swatches}
                value={vm.iconColor}
              />
              {vm.toneOptions.length > 0 ? (
                <ColorSwatchGroup
                  label={t("financial.categories.form.toneRow", {
                    name: vm.parentName,
                  })}
                  onChange={vm.onColorChange}
                  options={vm.toneOptions}
                  testID={categoryFormTestIds.tones}
                  value={vm.iconColor}
                />
              ) : null}
              <IconChoiceGroup
                label={t("financial.categories.form.icon")}
                moreLabel={t("financial.categories.form.moreIcons")}
                onChange={vm.onIconChange}
                onMorePress={vm.onIconPickerOpen}
                options={vm.inlineIcons}
                testID={categoryFormTestIds.icon}
                value={vm.icon}
              />
              {vm.isApplyVisible && (
                <ApplyToSubcategories
                  colorOn={vm.applyColorOn}
                  colorSwitchVisible={vm.colorSwitchVisible}
                  compact={breakpoint === "compact"}
                  description={t(
                    pluralKey(
                      "financial.categories.form.apply.description",
                      vm.applyCount,
                    ),
                    { count: vm.applyCount, name: vm.applyName },
                  )}
                  iconOn={vm.applyIconOn}
                  iconSwitchVisible={vm.iconSwitchVisible}
                  labels={{
                    archivedSuffix: t(
                      "financial.categories.form.apply.archivedSuffix",
                    ),
                    colorHint: t("financial.categories.form.apply.colorHint"),
                    colorSwitch: t(
                      breakpoint === "compact"
                        ? "financial.categories.form.apply.colorCompact"
                        : "financial.categories.form.apply.color",
                    ),
                    iconHint: t("financial.categories.form.apply.iconHint"),
                    iconSwitch: t("financial.categories.form.apply.icon"),
                    keeps: t("financial.categories.form.apply.keeps"),
                    offHint: t("financial.categories.form.apply.offHint", {
                      name: vm.applyName,
                    }),
                    preview: t("financial.categories.form.apply.preview"),
                    root: t("financial.categories.form.apply.root"),
                    title:
                      breakpoint === "compact"
                        ? t(
                            pluralKey(
                              "financial.categories.form.apply.titleCompact",
                              vm.applyCount,
                            ),
                            { count: vm.applyCount },
                          )
                        : t("financial.categories.form.apply.title"),
                  }}
                  onColorToggle={vm.onApplyColorToggle}
                  onIconToggle={vm.onApplyIconToggle}
                  preview={vm.applyPreview}
                  toneLabel={(number) =>
                    t("financial.categories.form.apply.tone", { number })
                  }
                />
              )}
              <View style={styles.helper}>
                <ChipGroup
                  disabled={vm.isOwnerLocked}
                  label={t("financial.common.belongsTo")}
                  layout={"wrap"}
                  mode={"single"}
                  onChange={vm.onOwnerChange}
                  options={translateChoices(vm.ownerChoices, t)}
                  testID={categoryFormTestIds.owner}
                  value={vm.ownerId}
                />
                {vm.ownerHelperKey && (
                  <Text.Caption
                    tone={"secondary"}
                    value={t(vm.ownerHelperKey)}
                  />
                )}
              </View>
            </>
          }
          testID={categoryFormTestIds.sheet}
        />
        {vm.isEditing && (
          <Card>
            <View style={styles.archiveRow}>
              <View style={styles.archiveHint}>
                <Text.Caption
                  tone={"secondary"}
                  value={t("financial.categories.archive.hint")}
                />
              </View>
              {vm.isArchived ? (
                <Button.Secondary
                  label={t("financial.categories.archive.reactivate")}
                  loading={vm.isUpdating}
                  onPress={vm.onReactivatePress}
                  testID={categoryFormTestIds.reactivateButton}
                />
              ) : (
                <Button.Secondary
                  label={t("financial.categories.archive.action")}
                  onPress={vm.onArchivePress}
                  testID={categoryFormTestIds.archiveButton}
                />
              )}
            </View>
          </Card>
        )}
        {vm.formErrorKey && (
          <Text.Body
            testID={categoryFormTestIds.formError}
            tone={"expense"}
            value={t(vm.formErrorKey)}
          />
        )}
      </View>
    );
  }

  return (
    <>
      <BottomSheet
        closeLabel={t("common.actions.close")}
        footer={
          <Button.Primary
            fullWidth
            label={t(vm.saveLabelKey, vm.saveLabelParams)}
            loading={vm.isSaving}
            onPress={vm.onSave}
            size={"lg"}
            testID={categoryFormTestIds.saveButton}
          />
        }
        footerStart={
          vm.isEditing && (
            <Button.Ghost
              label={t("financial.categories.delete")}
              onPress={vm.onDeletePress}
              testID={categoryFormTestIds.deleteButton}
              tone={"expense"}
            />
          )
        }
        onClose={vm.onClose}
        presentation={"inline"}
        size={"form"}
        testID={categoryFormTestIds.sheet}
        title={t(vm.titleKey)}
        visible
      >
        {renderBody()}
      </BottomSheet>
      {vm.isCustomColorOpen && (
        <CustomColorSheet
          applyLabel={t("financial.categories.form.customColorApply")}
          closeLabel={t("common.actions.close")}
          color={vm.iconColor}
          error={err(vm.customColorError)}
          hexLabel={t("financial.categories.form.customColorHex")}
          onApply={vm.onCustomColorApply}
          onChange={vm.onCustomColorChange}
          onClose={vm.onCustomColorClose}
          title={t("financial.categories.form.customColorTitle")}
          value={vm.customColorDraft}
        />
      )}
      {vm.isIconPickerOpen && (
        <IconPickerSheet
          closeLabel={t("common.actions.close")}
          icons={vm.pickerIcons}
          onClose={vm.onIconPickerClose}
          onQueryChange={vm.onIconQueryChange}
          onSelect={vm.onIconChange}
          query={vm.iconQuery}
          searchPlaceholder={t("common.search.placeholder")}
          selected={vm.icon}
          title={t("financial.categories.form.iconsTitle")}
        />
      )}
      <ConfirmDialog
        cancelLabel={t("common.form.keepEditing")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("common.form.discard")}
        message={t("common.form.discardMessage")}
        onCancel={vm.onDiscardCancel}
        onConfirm={vm.onDiscardConfirm}
        title={t("common.form.discardTitle")}
        visible={vm.isDiscardDialogOpen}
      />
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("financial.categories.archive.action")}
        loading={vm.isUpdating}
        message={vm.archiveBodyKeys.map((key) => t(key)).join(" ")}
        onCancel={vm.onArchiveCancel}
        onConfirm={vm.onArchiveConfirm}
        testID={categoryFormTestIds.archiveDialog}
        title={t("financial.categories.archive.confirmTitle")}
        visible={vm.isArchiveDialogOpen}
      />
      {vm.pendingItems && (
        <PendingItemsDialog
          bodyLabel={t("financial.categories.archive.pendingBody")}
          closeLabel={t("common.actions.close")}
          footnote={
            vm.pendingItems.hiddenCount > 0
              ? t("financial.categories.archive.pendingHidden", {
                  count: vm.pendingItems.hiddenCount,
                })
              : undefined
          }
          okLabel={t("financial.categories.archive.pendingOk")}
          onClose={vm.onPendingClose}
          sections={[
            {
              items: vm.pendingItems.recurrences.map((recurrence) => ({
                id: recurrence.id,
                label: t("financial.categories.archive.pendingRecurrenceLine", {
                  date: recurrence.date,
                  description: recurrence.description,
                }),
              })),
              title: t("financial.categories.archive.pendingRecurrences"),
            },
            {
              items: vm.pendingItems.plans.map((plan) => ({
                id: plan.id,
                label: t(
                  pluralKey(
                    "financial.categories.archive.pendingPlanLine",
                    plan.count,
                  ),
                  { count: plan.count, description: plan.description },
                ),
              })),
              title: t("financial.categories.archive.pendingPlans"),
            },
          ]}
          testIDs={{
            dialog: categoryFormTestIds.pendingDialog,
            ok: categoryFormTestIds.pendingOk,
          }}
          title={t("financial.categories.archive.pendingTitle")}
        />
      )}
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t(vm.deleteConfirmLabelKey)}
        loading={vm.isDeleting}
        message={vm.deleteMessageKeys.map((key) => t(key)).join(" ")}
        onCancel={vm.onDeleteCancel}
        onConfirm={vm.onDeleteConfirm}
        testID={categoryFormTestIds.deleteDialog}
        title={t("financial.categories.deleteTitle", vm.deleteTitleParams)}
        visible={vm.isDeleteDialogOpen}
      />
    </>
  );
}

export default NewCategoryModal;
