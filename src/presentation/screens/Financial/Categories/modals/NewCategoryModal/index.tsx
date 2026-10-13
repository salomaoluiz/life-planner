import { View } from "react-native";

import {
  BottomSheet,
  Button,
  ChipGroup,
  ColorSwatchGroup,
  ConfirmDialog,
  ErrorState,
  IconChoiceGroup,
  IconTile,
  SegmentedControl,
  SelectField,
  Text,
  TextField,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import { translateChoices } from "@screens/Financial/models/ownerOptions";

import CustomColorSheet from "./components/CustomColorSheet";
import IconPickerSheet from "./components/IconPickerSheet";
import { useNewCategoryViewModel } from "./hooks";
import useStyles from "./styles";

const SKELETON_ROWS = [0, 1, 2];

function NewCategoryModal() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useNewCategoryViewModel();

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
        <View style={styles.preview}>
          <IconTile color={vm.iconColor} name={vm.icon} size={"lg"} />
          <Text.Heading
            tone={vm.name ? "primary" : "secondary"}
            value={vm.name || t("financial.categories.form.namePlaceholder")}
          />
        </View>
        <TextField
          error={err(vm.nameError)}
          label={t("financial.categories.form.name")}
          maxLength={80}
          onChangeText={vm.onNameChange}
          placeholder={t("financial.categories.form.namePlaceholder")}
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
            value={vm.type}
          />
          {vm.typeHelperKey && (
            <Text.Caption tone={"secondary"} value={t(vm.typeHelperKey)} />
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
          value={vm.parentId}
        />
        <ColorSwatchGroup
          customLabel={t("financial.categories.form.customColor")}
          label={t("financial.categories.form.color")}
          onChange={vm.onColorChange}
          onCustomPress={vm.onCustomColorOpen}
          options={vm.colorOptions.map((option) => ({
            label: t(option.labelKey),
            value: option.value,
          }))}
          testID={"category-color"}
          value={vm.iconColor}
        />
        <IconChoiceGroup
          color={vm.iconColor}
          label={t("financial.categories.form.icon")}
          moreLabel={t("financial.categories.form.moreIcons")}
          onChange={vm.onIconChange}
          onMorePress={vm.onIconPickerOpen}
          options={vm.inlineIcons}
          testID={"category-icon"}
          value={vm.icon}
        />
        <View style={styles.helper}>
          <ChipGroup
            disabled={vm.isOwnerLocked}
            label={t("financial.common.belongsTo")}
            layout={"wrap"}
            mode={"single"}
            onChange={vm.onOwnerChange}
            options={translateChoices(vm.ownerChoices, t)}
            value={vm.ownerId}
          />
          {vm.ownerHelperKey && (
            <Text.Caption tone={"secondary"} value={t(vm.ownerHelperKey)} />
          )}
        </View>
        {vm.formErrorKey && (
          <Text.Body tone={"expense"} value={t(vm.formErrorKey)} />
        )}
        {vm.isEditing && (
          <Button.Ghost
            label={t("financial.categories.delete")}
            onPress={vm.onDeletePress}
            tone={"expense"}
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
            label={t(vm.saveLabelKey)}
            loading={vm.isSaving}
            onPress={vm.onSave}
            size={"lg"}
          />
        }
        onClose={vm.onClose}
        presentation={"inline"}
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
          color={vm.iconColor}
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
        confirmLabel={t("common.actions.delete")}
        loading={vm.isDeleting}
        message={vm.deleteMessageKeys.map((key) => t(key)).join(" ")}
        onCancel={vm.onDeleteCancel}
        onConfirm={vm.onDeleteConfirm}
        title={t("financial.categories.deleteTitle", vm.deleteTitleParams)}
        visible={vm.isDeleteDialogOpen}
      />
    </>
  );
}

export default NewCategoryModal;
