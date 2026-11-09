import { View } from "react-native";

import {
  AdaptiveViewProps,
  AmountInput,
  BottomSheet,
  Button,
  Card,
  ConfirmDialog,
  DateField,
  ErrorState,
  FormColumns,
  IconButton,
  SegmentedControl,
  SelectField,
  SwitchRow,
  Text,
  TextField,
} from "@components";
import Skeleton from "@components/Skeleton";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import { InvestmentOperationType } from "@domain/entities/investment/enums";
import { OperationPreview } from "@domain/entities/investment/position";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import {
  formatDay,
  formatMoney,
  formatQuantity,
  formatResult,
  formatUnitPrice,
  resultTone,
} from "@screens/Investment/models/format";
import investmentTestIds from "@screens/Investment/testIds";

import { OperationModalVM } from "../hooks";
import useStyles from "../styles";

const ids = investmentTestIds.modal.operation;

function Wide({ vm }: AdaptiveViewProps<OperationModalVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const sell = vm.type === InvestmentOperationType.SELL;
  const currency = vm.currency as CurrencyCode;

  function err(key?: TranslationKeys) {
    return key ? t(key) : undefined;
  }

  const categoryName = t(
    sell
      ? "investment.systemCategory.INVESTMENT_REDEMPTION"
      : "investment.systemCategory.INVESTMENT_CONTRIBUTION",
  );

  function renderSummary(preview: OperationPreview) {
    return (
      <Card testID={ids.preview}>
        <View style={styles.summary}>
          <View style={styles.summaryLine}>
            <Text.Caption
              tone="secondary"
              value={t("investment.form.operation.gross", {
                price: formatUnitPrice(
                  vm.unitPrice.replace(",", "."),
                  currency,
                  localeTag,
                ),
                quantity: formatQuantity(
                  vm.quantity.replace(",", "."),
                  localeTag,
                ),
              })}
            />
            <Text.Body
              tabular
              value={formatMoney(preview.totals.gross, currency, localeTag)}
            />
          </View>
          <View style={styles.summaryLine}>
            <Text.Caption
              tone="secondary"
              value={t("investment.form.operation.feesLine")}
            />
            <Text.Body
              tabular
              value={`${sell ? "−" : "+"} ${formatMoney(preview.totals.feesTotal, currency, localeTag)}`}
            />
          </View>
          <View style={styles.summaryLine}>
            <Text.BodyStrong
              value={t(
                sell
                  ? "investment.form.operation.totalReceived"
                  : "investment.form.operation.totalPaid",
              )}
            />
            <Text.BodyStrong
              tabular
              testID={ids.summaryTotal}
              value={formatMoney(preview.totals.total, currency, localeTag)}
            />
          </View>
        </View>
      </Card>
    );
  }

  function renderOutcome(preview: OperationPreview) {
    const average = preview.averagePrice
      ? formatUnitPrice(preview.averagePrice, currency, localeTag, 4)
      : "—";

    if (!sell) {
      return (
        <Card>
          <Text.Body
            value={t("investment.form.operation.newAverage", {
              value: average,
            })}
          />
        </Card>
      );
    }

    return (
      <Card>
        <View style={styles.summary}>
          {preview.realizedResult === null ? null : (
            <View style={styles.summaryLine}>
              <Text.Body
                value={t("investment.form.operation.realizedPreview")}
              />
              <Text.BodyStrong
                tabular
                tone={resultTone(preview.realizedResult)}
                value={formatResult(
                  preview.realizedResult,
                  currency,
                  localeTag,
                )}
              />
            </View>
          )}
          <Text.Caption
            tone="secondary"
            value={t("investment.form.operation.averageStays", {
              average,
              quantity: formatQuantity(preview.quantityAfter, localeTag),
            })}
          />
        </View>
      </Card>
    );
  }

  function renderBody() {
    if (vm.isNotFound) {
      return (
        <ErrorState
          message={t("investment.detail.notFound")}
          onRetry={vm.onClose}
          retryLabel={t("investment.form.close")}
        />
      );
    }

    if (vm.isLoading) {
      return (
        <View>
          <Skeleton.ListItem />
          <Skeleton.ListItem />
        </View>
      );
    }

    return (
      <View style={styles.form}>
        {vm.readOnlyKey ? (
          <Text.Caption tone="expense" value={t(vm.readOnlyKey)} />
        ) : null}
        <FormColumns
          left={
            <>
              <SegmentedControl
                accessibilityLabel={t("investment.form.operation.type")}
                disabled={vm.readOnly || vm.isEditing}
                onChange={vm.onTypeChange}
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
                ]}
                testID={ids.type}
                value={vm.type}
              />
              <View style={styles.pair}>
                <View style={styles.pairCell}>
                  <DateField
                    disabled={vm.readOnly}
                    label={t("investment.form.operation.date")}
                    maxDate={new Date()}
                    onChange={vm.onDateChange}
                    testID={ids.date}
                    value={vm.date}
                  />
                </View>
                <View style={styles.pairCell}>
                  <TextField
                    disabled={vm.readOnly}
                    error={
                      err(vm.quantityError) ??
                      (vm.insufficient
                        ? t("investment.form.operation.insufficient", {
                            date: formatDay(
                              vm.date.toISOString().slice(0, 10),
                              localeTag,
                            ),
                            quantity: formatQuantity(
                              vm.availableQuantity ?? "0",
                              localeTag,
                            ),
                          })
                        : undefined)
                    }
                    keyboardType="decimal-pad"
                    label={t("investment.form.operation.quantity")}
                    onChangeText={vm.onQuantityChange}
                    testID={ids.quantity}
                    value={vm.quantity}
                  />
                  {sell && vm.availableQuantity !== undefined ? (
                    <Text.Caption
                      testID={ids.available}
                      tone="secondary"
                      value={t("investment.form.operation.available", {
                        quantity: formatQuantity(
                          vm.availableQuantity,
                          localeTag,
                        ),
                      })}
                    />
                  ) : null}
                </View>
              </View>
              <TextField
                disabled={vm.readOnly}
                error={err(vm.unitPriceError)}
                keyboardType="decimal-pad"
                label={t("investment.form.operation.unitPrice")}
                onChangeText={vm.onUnitPriceChange}
                testID={ids.unitPrice}
                value={vm.unitPrice}
              />
              <View style={styles.feeStack}>
                <Text.BodyStrong value={t("investment.operation.fees")} />
                {vm.fees.map((fee, index) => (
                  <View key={fee.key} style={styles.feeStack}>
                    <View style={styles.feeRow}>
                      <View style={styles.feeKind}>
                        <SelectField
                          closeLabel={t("investment.form.close")}
                          disabled={vm.readOnly}
                          label={t("investment.form.operation.feeKind")}
                          onChange={(kind) => vm.onFeeKindChange(fee.key, kind)}
                          options={vm.feeKinds.map((kind) => ({
                            label: t(`investment.fee.${kind}`),
                            value: kind,
                          }))}
                          sheetTitle={t("investment.form.operation.feeKind")}
                          testID={ids.feeKind(index)}
                          value={fee.kind}
                        />
                      </View>
                      <View style={styles.feeCell}>
                        <AmountInput
                          currency={currency}
                          label={t("investment.form.operation.feeAmount")}
                          onChange={(cents) =>
                            vm.onFeeAmountChange(fee.key, cents)
                          }
                          testID={ids.feeAmount(index)}
                          value={fee.amountCents}
                        />
                      </View>
                      {vm.readOnly ? null : (
                        <IconButton
                          accessibilityLabel={t(
                            "investment.form.operation.removeFee",
                          )}
                          name="close"
                          onPress={() => vm.onFeeRemove(fee.key)}
                          testID={ids.feeRemove(index)}
                        />
                      )}
                    </View>
                    {fee.kind === "OTHER" ? (
                      <TextField
                        disabled={vm.readOnly}
                        error={err(vm.feeErrors[fee.key])}
                        label={t("investment.form.operation.feeDescription")}
                        maxLength={60}
                        onChangeText={(text) =>
                          vm.onFeeDescriptionChange(fee.key, text)
                        }
                        testID={ids.feeDescription(index)}
                        value={fee.description}
                      />
                    ) : null}
                  </View>
                ))}
                {vm.readOnly || vm.fees.length >= 10 ? null : (
                  <Button.Ghost
                    inline
                    label={`+ ${t("investment.form.operation.addFee")}`}
                    onPress={vm.onAddFee}
                    testID={ids.addFee}
                  />
                )}
                <Text.Caption
                  tone="secondary"
                  value={t("investment.form.operation.feesHint")}
                />
              </View>
            </>
          }
          right={
            <>
              {vm.preview ? renderSummary(vm.preview) : null}
              <SwitchRow
                hint={t("investment.form.operation.generateHint")}
                label={t("investment.form.operation.generate")}
                onToggle={vm.readOnly ? () => undefined : vm.onGenerateChange}
                testID={ids.generate}
                value={vm.generate}
              />
              {vm.generate ? (
                <View style={styles.field}>
                  <SelectField
                    closeLabel={t("investment.form.close")}
                    disabled={vm.readOnly}
                    error={err(vm.accountError)}
                    label={t("investment.form.operation.account")}
                    onChange={vm.onAccountChange}
                    options={vm.accountOptions}
                    sheetTitle={t("investment.form.operation.account")}
                    testID={ids.account}
                    value={vm.accountId}
                  />
                  <Text.Caption
                    tone="secondary"
                    value={t("investment.form.operation.accountHint", {
                      category: categoryName,
                    })}
                  />
                </View>
              ) : null}
              {vm.preview ? renderOutcome(vm.preview) : null}
            </>
          }
        />
        {vm.failure ? (
          <Text.Body
            tone="expense"
            value={t(vm.failure.key, vm.failure.params)}
          />
        ) : null}
      </View>
    );
  }

  return (
    <>
      <BottomSheet
        closeLabel={t("investment.form.close")}
        footer={
          vm.readOnly ? undefined : (
            <Button.Primary
              disabled={vm.insufficient}
              fullWidth
              label={t(vm.saveLabelKey)}
              loading={vm.isSaving}
              onPress={vm.onSave}
              size="lg"
              testID={ids.save}
            />
          )
        }
        footerStart={
          vm.isEditing && !vm.readOnly ? (
            <Button.Ghost
              label={t("investment.asset.delete")}
              onPress={vm.onDeleteOpen}
              testID={ids.delete}
              tone="expense"
            />
          ) : undefined
        }
        onClose={vm.onClose}
        presentation="inline"
        size="form"
        subtitle={vm.asset ? (vm.asset.ticker ?? vm.asset.name) : undefined}
        title={t(vm.titleKey)}
        visible
      >
        {renderBody()}
      </BottomSheet>
      <ConfirmDialog
        cancelLabel={t("common.form.keepEditing")}
        closeLabel={t("investment.form.close")}
        confirmLabel={t("common.form.discard")}
        message={t("common.form.discardMessage")}
        onCancel={vm.onDiscardCancel}
        onConfirm={vm.onDiscardConfirm}
        title={t("common.form.discardTitle")}
        visible={vm.discardOpen}
      />
      <ConfirmDialog
        cancelLabel={t("investment.form.cancel")}
        closeLabel={t("investment.form.close")}
        confirmLabel={t("investment.asset.delete")}
        loading={vm.isDeleting}
        message={t("investment.form.operation.deleteBody")}
        onCancel={vm.onDeleteCancel}
        onConfirm={vm.onDeleteConfirm}
        title={t("investment.form.operation.deleteTitle")}
        visible={vm.deleteOpen}
      />
    </>
  );
}

export default Wide;
