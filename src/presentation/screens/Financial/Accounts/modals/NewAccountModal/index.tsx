import { View } from "react-native";

import {
  AmountInput,
  BottomSheet,
  Button,
  ChipGroup,
  ConfirmDialog,
  ErrorState,
  IconChoiceGroup,
  IconTile,
  SegmentedControl,
  Switch,
  Text,
  TextField,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import { translateChoices } from "@screens/Financial/models/ownerOptions";

import { useNewAccountViewModel } from "./hooks";
import useStyles from "./styles";

const SKELETON_ROWS = [0, 1, 2];

function NewAccountModal() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useNewAccountViewModel();

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
            <Skeleton.ListItem key={row} testID={"account-form-skeleton"} />
          ))}
        </View>
      );
    }

    return (
      <View style={styles.form}>
        <View style={styles.preview}>
          <IconTile name={vm.icon} size={"lg"} tone={"accent"} />
          <Text.Heading
            tone={vm.name ? "primary" : "secondary"}
            value={vm.name || t("financial.accounts.form.name")}
          />
        </View>
        <TextField
          error={err(vm.nameError)}
          label={t("financial.accounts.form.name")}
          maxLength={80}
          onChangeText={vm.onNameChange}
          value={vm.name}
        />
        <IconChoiceGroup
          label={t("financial.accounts.form.icon")}
          onChange={vm.onIconChange}
          options={vm.iconOptions}
          testID={"account-icon"}
          value={vm.icon}
        />
        <View style={styles.helper}>
          <AmountInput
            error={err(vm.amountError)}
            label={t("financial.accounts.form.balance")}
            onChange={vm.onAmountChange}
            testID={"account-balance"}
            tone={vm.sign === "NEGATIVE" ? "expense" : "neutral"}
            value={vm.amountCents}
          />
          <SegmentedControl
            accessibilityLabel={t("financial.accounts.form.balance")}
            onChange={vm.onSignChange}
            options={vm.signOptions.map((option) => ({
              label: t(option.labelKey),
              tone: option.value === "NEGATIVE" ? "expense" : "income",
              value: option.value,
            }))}
            value={vm.sign}
          />
          <Text.Caption tone={"secondary"} value={t(vm.balanceHelperKey)} />
        </View>
        {vm.isEditing && (
          <View style={styles.helper}>
            <View style={styles.preview}>
              <Text.Body value={t("financial.accounts.form.archived")} />
              <Switch
                initialStatus={vm.isArchived}
                onToggle={vm.onArchivedChange}
                testID={"account-archived-switch"}
              />
            </View>
            <Text.Caption
              tone={"secondary"}
              value={t("financial.accounts.form.archivedHelper")}
            />
          </View>
        )}
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
            label={t("financial.accounts.delete")}
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
        message={t("financial.accounts.deleteAlertMsg")}
        onCancel={vm.onDeleteCancel}
        onConfirm={vm.onDeleteConfirm}
        title={t("financial.accounts.deleteTitle", vm.deleteTitleParams)}
        visible={vm.isDeleteDialogOpen}
      />
    </>
  );
}

export default NewAccountModal;
