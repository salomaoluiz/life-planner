import { View } from "react-native";

import {
  BottomSheet,
  Button,
  ChipGroup,
  ConfirmDialog,
  ErrorState,
  FormColumns,
  Text,
  TextField,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import { TranslationKeys } from "@presentation/i18n/types";
import { translateChoices } from "@screens/Financial/models/ownerOptions";

import { useNewTagViewModel } from "./hooks";
import { MAX_TAG_NAME } from "./models/tagFormState";
import useStyles from "./styles";
import tagFormTestIds from "./testIds";

const SKELETON_ROWS = [0, 1];

function NewTagModal() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useNewTagViewModel();

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
            <Skeleton.ListItem key={row} testID={"tag-form-skeleton"} />
          ))}
        </View>
      );
    }

    return (
      <View style={styles.form}>
        <FormColumns
          left={
            <>
              <TextField
                error={err(vm.nameError)}
                label={t("financial.tagForm.name")}
                maxLength={MAX_TAG_NAME + 1}
                onChangeText={vm.onNameChange}
                testID={tagFormTestIds.nameInput}
                value={vm.name}
              />
              {vm.isEditing && (
                <Text.Caption
                  testID={tagFormTestIds.usage}
                  tone={"secondary"}
                  value={t(pluralKey("financial.tagForm.usedIn", vm.usage), {
                    count: vm.usage,
                  })}
                />
              )}
            </>
          }
          right={
            <View style={styles.helper}>
              <ChipGroup
                disabled={vm.isOwnerLocked}
                label={t("financial.tagForm.owner")}
                layout={"wrap"}
                mode={"single"}
                onChange={vm.onOwnerChange}
                options={translateChoices(vm.ownerChoices, t)}
                testID={tagFormTestIds.owner}
                value={vm.ownerId}
              />
              {vm.ownerHelperKey && (
                <Text.Caption tone={"secondary"} value={t(vm.ownerHelperKey)} />
              )}
            </View>
          }
          testID={tagFormTestIds.sheet}
        />
        {vm.formErrorKey && (
          <Text.Body
            testID={tagFormTestIds.formError}
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
            label={t("financial.tagForm.save")}
            loading={vm.isSaving}
            onPress={vm.onSave}
            size={"lg"}
            testID={tagFormTestIds.saveButton}
          />
        }
        footerStart={
          vm.isEditing && (
            <Button.Ghost
              label={t("financial.tagForm.delete")}
              onPress={vm.onDeletePress}
              testID={tagFormTestIds.deleteButton}
              tone={"expense"}
            />
          )
        }
        onClose={vm.onClose}
        presentation={"inline"}
        size={"form"}
        testID={tagFormTestIds.sheet}
        title={t(
          vm.isEditing
            ? "financial.tagForm.editTitle"
            : "financial.tagForm.newTitle",
        )}
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
        confirmLabel={t(vm.deleteConfirmLabelKey)}
        loading={vm.isDeleting}
        message={t(vm.deleteMessageKey, { count: vm.usage })}
        onCancel={vm.onDeleteCancel}
        onConfirm={vm.onDeleteConfirm}
        testID={tagFormTestIds.deleteDialog}
        title={t("financial.tagDelete.title", vm.deleteTitleParams)}
        visible={vm.isDeleteDialogOpen}
      />
    </>
  );
}

export default NewTagModal;
