import { View } from "react-native";

import {
  AmountInput,
  BottomSheet,
  Button,
  ConfirmDialog,
  DateField,
  FormColumns,
  SelectField,
  SwitchRow,
  Text,
  TextField,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import { useTheme } from "@presentation/theme";

import SplitPartsEditor from "./components/SplitPartsEditor";
import SplitRemainingBanner from "./components/SplitRemainingBanner";
import { useSplitFormViewModel } from "./hooks";
import { MAX_NOTES } from "./models/splitFormState";
import splitFormTestIds from "./testIds";

// Spec 119 FR 41, 45: the transaction modal in split mode. Shared fields (description, optional total paid, date, source,
// paid, notes) on one side and the parts on the other: two columns on web/tablet, stacked on mobile (FormColumns).
function SplitForm() {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { theme } = useTheme();
  const vm = useSplitFormViewModel();
  const state = vm.state;

  function err(key?: TranslationKeys) {
    return key ? t(key) : undefined;
  }

  function renderBody() {
    if (!state || vm.isLoading) {
      return null;
    }

    return (
      <FormColumns
        left={
          <>
            <TextField
              error={err(vm.errors.description)}
              label={t("financial.split.form.description")}
              maxLength={200}
              onChangeText={vm.onDescriptionChange}
              testID={splitFormTestIds.description}
              value={state.description}
            />
            {vm.isTotalTyped ? (
              <>
                <AmountInput
                  currency={vm.currency}
                  label={t("financial.split.totalPaid")}
                  onChange={vm.onTotalPaidChange}
                  testID={splitFormTestIds.totalPaid}
                  tone="expense"
                  value={state.totalPaidCents}
                />
                <Text.Caption
                  tone="secondary"
                  value={t("financial.split.totalHint")}
                />
              </>
            ) : (
              <View
                style={{
                  alignItems: "center",
                  flexDirection: "row",
                  gap: theme.sizes.spacing.sm,
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text.Caption
                    tone="secondary"
                    value={t("financial.split.sumTotal")}
                  />
                  <Text.Headline
                    testID={splitFormTestIds.sumTotal}
                    value={formatAmount(vm.sumCents, localeTag, vm.currency)}
                  />
                </View>
                <Button.Secondary
                  label={t("financial.split.typeTotal")}
                  onPress={vm.onTotalTypePress}
                  testID={splitFormTestIds.typeTotal}
                />
              </View>
            )}
            <DateField
              error={err(vm.errors.date)}
              label={t("financial.split.form.date")}
              onChange={vm.onDateChange}
              testID={splitFormTestIds.date}
              todayLabel={t("common.date.today")}
              value={state.date}
              yesterdayLabel={t("common.date.yesterday")}
            />
            <SelectField
              closeLabel={t("common.actions.close")}
              error={err(vm.errors.source)}
              label={t("financial.split.form.source")}
              onChange={vm.onSourceChange}
              options={vm.sourceOptions.map((option) => ({
                label: option.label,
                value: option.value,
              }))}
              sheetTitle={t("financial.split.form.source")}
              testID={splitFormTestIds.source}
              value={vm.sourceValue}
            />
            {vm.isCard ? (
              <Text.Caption
                tone="secondary"
                value={t("financial.split.cardExpenseOnly")}
              />
            ) : (
              <SwitchRow
                label={t("financial.split.form.paid")}
                onToggle={vm.onPaidChange}
                testID={splitFormTestIds.paid}
                value={state.paid}
              />
            )}
            <TextField
              counter={`${state.notes.length}/${MAX_NOTES}`}
              label={t("financial.split.form.notes")}
              maxLength={MAX_NOTES}
              minLines={3}
              multiline
              onChangeText={vm.onNotesChange}
              testID={splitFormTestIds.notes}
              value={state.notes}
            />
            {vm.errorKey ? (
              <Text.Body
                testID={splitFormTestIds.formError}
                tone="expense"
                value={t(vm.errorKey)}
              />
            ) : null}
          </>
        }
        right={
          <>
            <Text.BodyStrong
              value={t("financial.split.parts", { count: state.parts.length })}
            />
            <SplitPartsEditor
              canAddPart={vm.canAddPart}
              categoryNodes={vm.categoryNodes}
              currency={vm.currency}
              errors={vm.errors}
              isCard={vm.isCard}
              onAdd={vm.onAddPart}
              onAdjustmentKindChange={vm.onAdjustmentKindChange}
              onCategoryChange={vm.onPartCategoryChange}
              onDescriptionChange={vm.onPartDescriptionChange}
              onRemove={vm.onPartRemove}
              onTagsChange={vm.onPartTagsChange}
              onTypeChange={vm.onPartTypeChange}
              onValueChange={vm.onPartValueChange}
              parts={state.parts}
              tagSuggestions={vm.tagSuggestions}
            />
            <SplitRemainingBanner
              currency={vm.currency}
              onAdjust={vm.onAdjust}
              onPartPick={vm.onPartPick}
              partOptions={state.parts
                .filter((part) => !part.adjustment)
                .map((part, index) => ({
                  label: part.description || `${index + 1}`,
                  value: part.key,
                }))}
              remainingCents={vm.remainingCents}
            />
          </>
        }
      />
    );
  }

  const canSave = !!state && !vm.isBlocking && vm.remainingCents === 0;

  return (
    <>
      <BottomSheet
        closeLabel={t("common.actions.close")}
        footer={
          <Button.Primary
            disabled={!canSave}
            fullWidth
            label={t("financial.split.form.save")}
            loading={vm.isBlocking}
            onPress={vm.onSave}
            size={"lg"}
            testID={splitFormTestIds.saveButton}
          />
        }
        footerStart={
          vm.isEditing ? (
            <View style={{ flexDirection: "row", gap: theme.sizes.spacing.sm }}>
              {vm.canUndo ? (
                <Button.Ghost
                  disabled={vm.isBlocking}
                  label={t("financial.split.undo")}
                  onPress={vm.onUndoPress}
                  testID={splitFormTestIds.undoButton}
                />
              ) : null}
              <Button.Ghost
                disabled={vm.isBlocking}
                label={t("financial.split.deleteGroup")}
                onPress={vm.onDeletePress}
                testID={splitFormTestIds.deleteButton}
                tone={"expense"}
              />
            </View>
          ) : undefined
        }
        onClose={vm.onClose}
        presentation={"inline"}
        size={"form"}
        testID={splitFormTestIds.sheet}
        title={t(
          vm.isEditing
            ? "financial.split.form.editTitle"
            : "financial.split.form.title",
        )}
        visible
      >
        <View
          pointerEvents={vm.isBlocking ? "none" : "auto"}
          style={vm.isBlocking ? { opacity: 0.6 } : undefined}
        >
          {renderBody()}
        </View>
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
        message={t("financial.split.delete.message")}
        onCancel={vm.onDeleteCancel}
        onConfirm={vm.onDeleteConfirm}
        testID={splitFormTestIds.deleteDialog}
        title={t("financial.split.delete.title")}
        visible={vm.isDeleteDialogOpen}
      />
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("financial.split.undo")}
        message={t("financial.split.undoDialog.message")}
        onCancel={vm.onUndoCancel}
        onConfirm={vm.onUndoConfirm}
        testID={splitFormTestIds.undoDialog}
        title={t("financial.split.undoDialog.title")}
        visible={vm.isUndoDialogOpen}
      />
    </>
  );
}

export default SplitForm;
