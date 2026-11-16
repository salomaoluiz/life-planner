import { StyleSheet, View } from "react-native";

import {
  AdaptiveViewProps,
  AmountInput,
  BottomSheet,
  Button,
  Card,
  DateField,
  ErrorState,
  FormColumns,
  SegmentedControl,
  SelectField,
  Text,
  TextField,
  TickerAutocomplete,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import { formatUnitPrice } from "@screens/Investment/models/format";
import investmentTestIds from "@screens/Investment/testIds";

import { ConversionModalVM } from "../hooks";

const ids = investmentTestIds.modal.conversion;

// Spec 112 section 8 (artboards "Modal converter ativo" / "Converter ativo"): two columns on web/tablet, one on mobile
// (FormColumns); left = what the owner types, right = the before/after of both positions and the finance strip.
function Wide({ vm }: AdaptiveViewProps<ConversionModalVM>) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { spacing } = useKitTheme();
  const styles = StyleSheet.create({
    cell: { flex: 1 },
    field: { gap: spacing.xs },
    form: { gap: spacing.md },
    line: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    pair: { alignItems: "flex-start", flexDirection: "row", gap: spacing.sm },
    table: { gap: spacing.sm },
  });
  const preview = vm.preview;

  function err(show: boolean, key: TranslationKeys) {
    return show ? t(key) : undefined;
  }

  function renderTable(
    title: string,
    rows: { after: string; before: string; label: string }[],
  ) {
    return (
      <Card>
        <View style={styles.table}>
          <View style={styles.line}>
            <Text.BodyStrong value={title} />
            <Text.Caption
              tone="secondary"
              value={t("investment.conversion.before")}
            />
            <Text.Caption
              tone="secondary"
              value={t("investment.conversion.after")}
            />
          </View>
          {rows.map((row) => (
            <View key={row.label} style={styles.line}>
              <Text.Body tone="secondary" value={row.label} />
              <Text.Body tabular value={row.before} />
              <Text.BodyStrong tabular value={row.after} />
            </View>
          ))}
        </View>
      </Card>
    );
  }

  function renderDestination() {
    if (vm.isEdit) {
      return (
        <Text.BodyStrong
          testID={ids.destinationExisting}
          value={vm.destinationTicker}
        />
      );
    }

    return (
      <>
        <SegmentedControl
          accessibilityLabel={t("investment.conversion.destination")}
          onChange={vm.onModeChange}
          options={[
            { label: t("investment.conversion.existing"), value: "existing" },
            { label: t("investment.conversion.createNew"), value: "new" },
          ]}
          testID={ids.segment}
          value={vm.mode}
        />
        {vm.mode === "existing" ? (
          renderPicker()
        ) : (
          <>
            <TickerAutocomplete
              error={err(
                vm.errors.ticker,
                "investment.conversion.errors.ticker",
              )}
              label={t("investment.conversion.ticker")}
              maxLength={20}
              onChangeText={vm.onTickerChange}
              onSelect={vm.onTickerSelect}
              resultsLabel={(count) =>
                t("investment.ticker.suggestions", { count })
              }
              suggestions={vm.suggestions.map((item) => ({
                exchange: item.exchange,
                name: item.name,
                priceText: formatUnitPrice(
                  item.price,
                  item.currency,
                  localeTag,
                ),
                ticker: item.ticker,
              }))}
              testID={ids.ticker}
              value={vm.ticker}
            />
            <TextField
              error={err(vm.errors.name, "investment.form.asset.nameRequired")}
              label={t("investment.conversion.name")}
              onChangeText={vm.onNameChange}
              testID={ids.name}
              value={vm.name}
            />
            <Text.Caption
              tone="secondary"
              value={t("investment.conversion.fromOrigin")}
            />
          </>
        )}
      </>
    );
  }

  function renderPicker() {
    if (vm.destinationOptions.length === 0) {
      return (
        <Text.Caption
          testID={ids.destinationPicker}
          tone="secondary"
          value={t("investment.conversion.pickerEmpty")}
        />
      );
    }

    return (
      <SelectField
        closeLabel={t("investment.form.close")}
        error={err(vm.errors.destination, "investment.conversion.pickerEmpty")}
        label={t("investment.conversion.destination")}
        onChange={vm.onDestinationChange}
        options={vm.destinationOptions}
        sheetTitle={t("investment.conversion.destination")}
        testID={ids.destinationPicker}
        value={vm.destinationId}
      />
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
      return <Skeleton.ListItem />;
    }

    return (
      <View style={styles.form}>
        <FormColumns
          left={
            <>
              <View style={styles.field}>
                <DateField
                  error={err(
                    vm.errors.date === "future",
                    "investment.fraction.dateErrors.future",
                  )}
                  label={t("investment.conversion.date")}
                  maxDate={new Date()}
                  onChange={vm.onDateChange}
                  testID={ids.date}
                  value={vm.date}
                />
                <Text.Caption
                  tone="secondary"
                  value={t("investment.conversion.dateHint")}
                />
              </View>
              <View style={styles.field}>
                <Text.BodyStrong
                  value={t("investment.conversion.destination")}
                />
                {renderDestination()}
              </View>
              <View style={styles.field}>
                <Text.BodyStrong value={t("investment.conversion.ratio")} />
                <View style={styles.pair}>
                  <View style={styles.cell}>
                    <TextField
                      error={err(
                        vm.errors.ratioFrom,
                        "investment.conversion.errors.ratio",
                      )}
                      keyboardType="decimal-pad"
                      label={vm.originTicker}
                      onChangeText={vm.onRatioFromChange}
                      testID={ids.ratioFrom}
                      value={vm.ratioFrom}
                    />
                  </View>
                  <Text.Body
                    tone="secondary"
                    value={t("investment.conversion.become")}
                  />
                  <View style={styles.cell}>
                    <TextField
                      error={err(
                        vm.errors.ratioTo,
                        "investment.conversion.errors.ratio",
                      )}
                      keyboardType="decimal-pad"
                      label={
                        vm.destinationTicker ||
                        t("investment.conversion.destination")
                      }
                      onChangeText={vm.onRatioToChange}
                      testID={ids.ratioTo}
                      value={vm.ratioTo}
                    />
                  </View>
                </View>
                <Text.Caption
                  tone="secondary"
                  value={t("investment.conversion.ratioHint")}
                />
              </View>
              <View style={styles.field}>
                <AmountInput
                  currency={vm.currency}
                  label={t("investment.conversion.cash")}
                  onChange={vm.onCashChange}
                  testID={ids.cash}
                  tone="income"
                  value={vm.cashAmount}
                />
                <Text.Caption
                  tone="secondary"
                  value={t("investment.conversion.cashHint")}
                />
              </View>
              {vm.hasCash ? (
                <>
                  <SelectField
                    closeLabel={t("investment.form.close")}
                    error={err(
                      vm.errors.account,
                      "investment.form.operation.accountRequired",
                    )}
                    label={t("investment.conversion.account")}
                    onChange={vm.onAccountChange}
                    options={vm.accountOptions}
                    sheetTitle={t("investment.conversion.account")}
                    testID={ids.account}
                    value={vm.accountId}
                  />
                  <View style={styles.field}>
                    <TextField
                      error={err(
                        vm.errors.referenceValue,
                        "investment.conversion.errors.ratio",
                      )}
                      keyboardType="decimal-pad"
                      label={t("investment.conversion.referenceValue")}
                      onChangeText={vm.onReferenceChange}
                      testID={ids.referenceValue}
                      value={vm.referenceValue}
                    />
                    <Text.Caption
                      tone="secondary"
                      value={t("investment.conversion.referenceValueHint")}
                    />
                  </View>
                </>
              ) : null}
            </>
          }
          right={
            <>
              {preview ? (
                <View style={styles.form} testID={ids.preview}>
                  {renderTable(
                    `${vm.originTicker} (${t("investment.conversion.originLabel")})`,
                    [
                      {
                        after: "0",
                        before: preview.quantityOrigin,
                        label: t("investment.conversion.quantity"),
                      },
                      {
                        after: "0",
                        before: preview.costOrigin,
                        label: t("investment.conversion.cost"),
                      },
                    ],
                  )}
                  {renderTable(
                    `${vm.destinationTicker || t("investment.conversion.destination")} (${t("investment.conversion.destinationLabel")})`,
                    [
                      {
                        after: preview.quantityAfter,
                        before: preview.quantityBefore,
                        label: t("investment.conversion.quantity"),
                      },
                      {
                        after: preview.costAfter,
                        before: preview.costBefore,
                        label: t("investment.conversion.cost"),
                      },
                      {
                        after: preview.averagePriceAfter,
                        before: "",
                        label: t("investment.conversion.averagePrice"),
                      },
                    ],
                  )}
                  {preview.hasFraction ? (
                    <Card>
                      <Text.Caption
                        tone="secondary"
                        value={t("investment.conversion.fractionInfo", {
                          cost: preview.fractionCost,
                          fraction: preview.fractionQuantity,
                          quantity: preview.quantityIn,
                          raw: preview.raw,
                        })}
                      />
                    </Card>
                  ) : null}
                </View>
              ) : null}
              <View style={styles.field}>
                <Text.Caption
                  tone="secondary"
                  value={
                    vm.hasCash
                      ? `${t("investment.conversion.financeEntry")}: ${t(
                          "investment.conversion.cashLabel",
                          {
                            from: vm.originTicker,
                            to: vm.destinationTicker,
                          },
                        )}`
                      : t("investment.conversion.noFinanceEntry")
                  }
                />
                <Text.Caption
                  tone="secondary"
                  value={t("investment.conversion.originAfter", {
                    ticker: vm.originTicker,
                  })}
                />
              </View>
              {vm.failure ? (
                <Text.Body
                  testID={ids.error}
                  tone="expense"
                  value={t(vm.failure.key, vm.failure.params)}
                />
              ) : null}
            </>
          }
        />
      </View>
    );
  }

  return (
    <BottomSheet
      closeLabel={t("investment.form.close")}
      footer={
        <Button.Primary
          fullWidth
          label={t("investment.conversion.submit")}
          loading={vm.isSaving}
          onPress={vm.onSubmit}
          size="lg"
          testID={ids.submit}
        />
      }
      onClose={vm.onClose}
      presentation="inline"
      size="form"
      subtitle={t("investment.conversion.subtitle")}
      title={t(
        vm.isEdit
          ? "investment.conversion.editTitle"
          : "investment.conversion.title",
        {
          from: vm.originTicker,
          ticker: vm.originTicker,
          to: vm.destinationTicker,
        },
      )}
      visible
    >
      {renderBody()}
    </BottomSheet>
  );
}

export default Wide;
