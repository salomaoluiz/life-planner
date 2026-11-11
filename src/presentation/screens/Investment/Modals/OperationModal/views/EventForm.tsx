import { View } from "react-native";

import {
  BottomSheet,
  Button,
  Card,
  ConfirmDialog,
  DateField,
  FormColumns,
  SegmentedControl,
  SelectField,
  Text,
  TextField,
} from "@components";
import { InvestmentOperationType } from "@domain/entities/investment/enums";
import { useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import investmentTestIds from "@screens/Investment/testIds";

import { EventFormVM, OperationModalVM } from "../hooks";
import useStyles from "../styles";

const ids = investmentTestIds.modal.event;

interface Props {
  form: EventFormVM;
  parent: OperationModalVM;
}

// Spec 108 section 8 (artboards "Modal evento corporativo"): two columns on web/tablet, one on mobile (FormColumns);
// left = what the owner types, right = the position before and after, the fraction box and "no finance entry".
function EventForm({ form, parent }: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const bonus = form.type === InvestmentOperationType.BONUS;
  const locked = form.readOnly;

  function err(key?: TranslationKeys) {
    return key ? t(key) : undefined;
  }

  const rows = form.preview
    ? ([
        ["investment.event.quantity", form.preview.quantity],
        ["investment.event.cost", form.preview.cost],
        ["investment.event.averagePrice", form.preview.averagePrice],
      ] as const)
    : [];
  const deleteLines = form.deleteBodyLines.map(
    (line) => `• ${t(line.key, line.params)}`,
  );

  return (
    <>
      <BottomSheet
        closeLabel={t("investment.form.close")}
        footer={
          locked ? undefined : (
            <Button.Primary
              fullWidth
              label={t(form.saveKey)}
              loading={form.isSaving}
              onPress={form.onSave}
              size="lg"
              testID={form.isSuggestion ? ids.approve : ids.save}
            />
          )
        }
        footerStart={renderFooterStart()}
        onClose={form.onClose}
        presentation="inline"
        size="form"
        subtitle={form.isSuggestion ? undefined : form.ticker}
        title={t(form.titleKey, { ticker: form.ticker })}
        visible
      >
        <View style={styles.form}>
          <FormColumns
            left={
              <>
                <SegmentedControl
                  accessibilityLabel={t("investment.form.operation.type")}
                  disabled={locked || form.isSuggestion || form.isEditing}
                  onChange={parent.onTypeChange}
                  options={[
                    {
                      label: t("investment.operation.BUY"),
                      value: InvestmentOperationType.BUY,
                    },
                    {
                      label: t("investment.operation.SELL"),
                      tone: "expense",
                      value: InvestmentOperationType.SELL,
                    },
                    { label: t("investment.operation.EVENT"), value: "EVENT" },
                  ]}
                  testID={ids.segment}
                  value="EVENT"
                />
                <SelectField
                  closeLabel={t("investment.form.close")}
                  disabled={locked || form.isEditing}
                  label={t("investment.event.type")}
                  onChange={form.onTypeChange}
                  options={form.eventTypes.map((type) => ({
                    label: t(`investment.operation.${type}`),
                    value: type,
                  }))}
                  sheetTitle={t("investment.event.type")}
                  testID={ids.type}
                  value={form.type}
                />
                <View style={styles.field}>
                  <DateField
                    disabled={locked}
                    label={t("investment.event.recordDate")}
                    maxDate={new Date()}
                    onChange={form.onDateChange}
                    testID={ids.recordDate}
                    value={form.date}
                  />
                  <Text.Caption
                    tone="secondary"
                    value={t("investment.event.recordDateHint")}
                  />
                </View>
                {bonus ? (
                  <View style={styles.pair}>
                    <View style={styles.pairCell}>
                      <TextField
                        disabled={locked}
                        error={err(form.errors.bonusPercent)}
                        keyboardType="decimal-pad"
                        label={t("investment.event.bonusPercent")}
                        onChangeText={form.onBonusPercentChange}
                        testID={ids.bonusPercent}
                        value={form.bonusPercent}
                      />
                      {form.bonusEvery ? (
                        <Text.Caption
                          tone="secondary"
                          value={t("investment.event.bonusPercentHint", {
                            n: form.bonusEvery,
                          })}
                        />
                      ) : null}
                    </View>
                    <View style={styles.pairCell}>
                      <TextField
                        disabled={locked}
                        error={err(form.errors.bonusUnitCost)}
                        keyboardType="decimal-pad"
                        label={t("investment.event.bonusUnitCost")}
                        onChangeText={form.onBonusUnitCostChange}
                        testID={ids.bonusUnitCost}
                        value={form.bonusUnitCost}
                      />
                      <Text.Caption
                        tone="secondary"
                        value={t("investment.event.bonusUnitCostHint")}
                      />
                    </View>
                  </View>
                ) : (
                  <View style={styles.field}>
                    <View style={styles.pair}>
                      <View style={styles.pairCell}>
                        <TextField
                          disabled={locked}
                          error={err(form.errors.ratioFrom)}
                          keyboardType="decimal-pad"
                          label={t("investment.event.ratioFrom")}
                          onChangeText={form.onRatioFromChange}
                          testID={ids.ratioFrom}
                          value={form.ratioFrom}
                        />
                      </View>
                      <View style={styles.pairCell}>
                        <TextField
                          disabled={locked}
                          error={err(form.errors.ratioTo)}
                          keyboardType="decimal-pad"
                          label={t("investment.event.ratioTo")}
                          onChangeText={form.onRatioToChange}
                          testID={ids.ratioTo}
                          value={form.ratioTo}
                        />
                      </View>
                    </View>
                    {form.ratioFrom && form.ratioTo ? (
                      <Text.Caption
                        tone="secondary"
                        value={t("investment.event.splitHint", {
                          from: form.ratioFrom,
                          to: form.ratioTo,
                        })}
                      />
                    ) : null}
                  </View>
                )}
              </>
            }
            right={
              <>
                {form.preview ? (
                  <Card testID={ids.preview}>
                    <View style={styles.summary}>
                      <View style={styles.summaryLine}>
                        <Text.Caption tone="secondary" value="" />
                        <Text.Caption
                          tone="secondary"
                          value={t("investment.event.before")}
                        />
                        <Text.Caption
                          tone="secondary"
                          value={t("investment.event.after")}
                        />
                      </View>
                      {rows.map(([key, row]) => (
                        <View key={key} style={styles.summaryLine}>
                          <Text.Body tone="secondary" value={t(key)} />
                          <Text.Body tabular value={row.before} />
                          <Text.BodyStrong tabular value={row.after} />
                        </View>
                      ))}
                    </View>
                  </Card>
                ) : null}
                {form.noPosition ? (
                  <Text.Caption
                    tone="expense"
                    value={t("investment.event.noPosition", {
                      date: form.noPositionDate,
                    })}
                  />
                ) : null}
                {form.hasFraction ? (
                  <Card>
                    <Text.Caption
                      tone="secondary"
                      value={t("investment.event.fractionInfo", {
                        fraction: form.fractionQuantity,
                        new: form.newShares,
                      })}
                    />
                  </Card>
                ) : null}
                <View style={styles.summaryLine}>
                  <Text.Caption
                    tone="secondary"
                    value={t("investment.event.noFinanceEntry")}
                  />
                </View>
                {form.failure ? (
                  <Text.Body
                    tone="expense"
                    value={t(form.failure.key, form.failure.params)}
                  />
                ) : null}
              </>
            }
          />
        </View>
      </BottomSheet>
      <ConfirmDialog
        cancelLabel={t("common.form.keepEditing")}
        closeLabel={t("investment.form.close")}
        confirmLabel={t("common.form.discard")}
        message={t("common.form.discardMessage")}
        onCancel={form.onDiscardCancel}
        onConfirm={form.onDiscardConfirm}
        title={t("common.form.discardTitle")}
        visible={form.discardOpen}
      />
      <ConfirmDialog
        cancelLabel={t("investment.form.cancel")}
        closeLabel={t("investment.form.close")}
        confirmLabel={t("investment.event.deleteConfirm")}
        loading={form.isDeleting}
        message={[
          t("investment.event.deleteBody"),
          ...deleteLines,
          "",
          t("investment.event.deleteSuggestionNote"),
        ].join("\n")}
        onCancel={form.onDeleteCancel}
        onConfirm={form.onDeleteConfirm}
        testID={ids.deleteDialog}
        title={t("investment.event.deleteTitle", {
          date: form.deleteDate,
          type: form.deleteType
            ? t(`investment.operation.${form.deleteType}`).toLowerCase()
            : "",
        })}
        visible={form.deleteOpen}
      />
    </>
  );

  function renderFooterStart() {
    if (locked) {
      return undefined;
    }
    if (form.isSuggestion) {
      return (
        <Button.Ghost
          label={t("investment.event.rejectSuggestion")}
          onPress={form.onReject}
          testID={ids.rejectSuggestion}
          tone="expense"
        />
      );
    }

    return form.isEditing ? (
      <Button.Ghost
        label={t("investment.asset.delete")}
        onPress={form.onDeleteOpen}
        testID={ids.delete}
        tone="expense"
      />
    ) : undefined;
  }
}

export default EventForm;
