import { View } from "react-native";

import {
  AmountInput,
  BottomSheet,
  Button,
  ChipGroup,
  ConfirmDialog,
  ErrorState,
  FormColumns,
  IconChoiceGroup,
  IconTile,
  SegmentedControl,
  Switch,
  Text,
  TextField,
} from "@components";
import Skeleton from "@components/Skeleton";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { TranslationKeys } from "@presentation/i18n/types";
import { translateChoices } from "@screens/Financial/models/ownerOptions";

import { useNewAccountViewModel } from "./hooks";
import useStyles from "./styles";
import accountFormTestIds from "./testIds";

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
        <FormColumns
          left={
            <>
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
                testID={accountFormTestIds.nameInput}
                value={vm.name}
              />
              <IconChoiceGroup
                label={t("financial.accounts.form.icon")}
                onChange={vm.onIconChange}
                options={vm.iconOptions}
                testID={accountFormTestIds.icon}
                value={vm.icon}
              />
            </>
          }
          right={
            <>
              <View style={styles.helper}>
                <AmountInput
                  currency={DEFAULT_CURRENCY}
                  error={err(vm.amountError)}
                  label={t(vm.balanceLabelKey)}
                  onChange={vm.onAmountChange}
                  testID={accountFormTestIds.balanceInput}
                  tone={vm.sign === "NEGATIVE" ? "expense" : "neutral"}
                  value={vm.amountCents}
                />
                <SegmentedControl
                  accessibilityLabel={t(vm.balanceLabelKey)}
                  onChange={vm.onSignChange}
                  options={vm.signOptions.map((option) => ({
                    label: t(option.labelKey),
                    tone: option.value === "NEGATIVE" ? "expense" : "income",
                    value: option.value,
                  }))}
                  value={vm.sign}
                />
                <Text.Caption
                  tone={"secondary"}
                  value={t(vm.balanceHelperKey)}
                />
              </View>
              {vm.isEditing && (
                <View style={styles.helper}>
                  <View style={styles.preview}>
                    <Text.Body value={t("financial.accounts.form.archived")} />
                    <Switch
                      initialStatus={vm.isArchived}
                      onToggle={vm.onArchivedChange}
                      testID={accountFormTestIds.archivedSwitch}
                    />
                  </View>
                  <Text.Caption
                    tone={"secondary"}
                    value={t("financial.accounts.form.archivedHelper")}
                  />
                  {vm.archiveWarningCount > 0 ? (
                    <Text.Caption
                      testID={accountFormTestIds.archiveWarning}
                      tone={"expense"}
                      value={t(
                        pluralKey(
                          "financial.recurrence.archiveWarning",
                          vm.archiveWarningCount,
                        ),
                        {
                          count: vm.archiveWarningCount,
                        },
                      )}
                    />
                  ) : null}
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
                  testID={accountFormTestIds.owner}
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
          testID={accountFormTestIds.sheet}
        />
        {vm.formErrorKey && (
          <Text.Body
            testID={accountFormTestIds.formError}
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
            label={t(vm.saveLabelKey)}
            loading={vm.isSaving}
            onPress={vm.onSave}
            size={"lg"}
            testID={accountFormTestIds.saveButton}
          />
        }
        footerStart={
          vm.isEditing && (
            <Button.Ghost
              label={t("financial.accounts.delete")}
              onPress={vm.onDeletePress}
              testID={accountFormTestIds.deleteButton}
              tone={"expense"}
            />
          )
        }
        onClose={vm.onClose}
        presentation={"inline"}
        size={"form"}
        testID={accountFormTestIds.sheet}
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
        testID={accountFormTestIds.deleteDialog}
        title={t("financial.accounts.deleteTitle", vm.deleteTitleParams)}
        visible={vm.isDeleteDialogOpen}
      />
    </>
  );
}

export default NewAccountModal;
