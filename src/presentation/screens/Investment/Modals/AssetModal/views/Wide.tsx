import { View } from "react-native";

import {
  AdaptiveViewProps,
  BottomSheet,
  Button,
  Card,
  ChipGroup,
  ConfirmDialog,
  ErrorState,
  FormColumns,
  SelectField,
  SwitchRow,
  Text,
  TextField,
  TickerAutocomplete,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import { translateChoices } from "@screens/Financial/models/ownerOptions";
import {
  formatPercent,
  formatUnitPrice,
  resultTone,
} from "@screens/Investment/models/format";
import investmentTestIds from "@screens/Investment/testIds";

import { AssetModalVM } from "../hooks";
import useStyles from "../styles";

const ids = investmentTestIds.modal.asset;

function Wide({ vm }: AdaptiveViewProps<AssetModalVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const localeTag = useLocaleTag();

  function err(key?: TranslationKeys) {
    if (!key) {
      return undefined;
    }

    return key === "investment.ticker.notFound"
      ? t(key, { q: vm.ticker })
      : t(key);
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
        <FormColumns
          left={
            <>
              <View style={styles.field}>
                <SelectField
                  closeLabel={t("investment.form.close")}
                  disabled={vm.classLocked}
                  label={t("investment.form.asset.class")}
                  onChange={vm.onAssetClassChange}
                  options={vm.classOptions.map((option) => ({
                    label: t(option.labelKey),
                    value: option.value,
                  }))}
                  sheetTitle={t("investment.form.asset.class")}
                  testID={ids.class}
                  value={vm.assetClass}
                />
                <Text.Caption
                  tone="secondary"
                  value={t(
                    vm.classLocked
                      ? "investment.errors.classLocked"
                      : "investment.form.asset.classHint",
                  )}
                />
              </View>
              {vm.showCalculated ? (
                <SwitchRow
                  label={t("investment.fixedIncome.calculated")}
                  onToggle={vm.onCalculatedChange}
                  testID={ids.calculated}
                  value={vm.calculated}
                />
              ) : null}
              <View style={styles.field}>
                {vm.quotedMarket ? (
                  <TickerAutocomplete
                    error={err(vm.tickerError)}
                    helper={
                      vm.searchUnavailable
                        ? t("investment.ticker.sourceUnavailable")
                        : t("investment.ticker.searchHint")
                    }
                    label={t("investment.form.asset.ticker")}
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
                ) : (
                  <>
                    <TextField
                      autoCapitalize="characters"
                      error={err(vm.tickerError)}
                      label={t("investment.form.asset.ticker")}
                      maxLength={20}
                      onChangeText={vm.onTickerChange}
                      testID={ids.ticker}
                      value={vm.ticker}
                    />
                    <Text.Caption
                      tone="secondary"
                      value={t("investment.form.asset.tickerHint")}
                    />
                  </>
                )}
              </View>
            </>
          }
          right={
            <>
              <TextField
                error={err(vm.nameError)}
                label={t("investment.form.asset.name")}
                maxLength={100}
                onChangeText={vm.onNameChange}
                testID={ids.name}
                value={vm.name}
              />
              <View style={styles.field}>
                <ChipGroup
                  label={t("investment.form.asset.owner")}
                  layout="wrap"
                  mode="single"
                  onChange={vm.onOwnerChange}
                  options={translateChoices(vm.ownerChoices, t)}
                  testID={ids.owner}
                  value={vm.ownerId}
                />
                <Text.Caption
                  tone="secondary"
                  value={t("investment.form.asset.ownerHint")}
                />
              </View>
              <View style={styles.field}>
                <SelectField
                  closeLabel={t("investment.form.close")}
                  disabled={vm.classLocked || vm.currencyReadOnly}
                  label={t("investment.form.asset.currency")}
                  onChange={vm.onCurrencyChange}
                  options={vm.currencyOptions.map((code) => ({
                    label: code,
                    value: code,
                  }))}
                  sheetTitle={t("investment.form.asset.currency")}
                  testID={ids.currency}
                  value={vm.currency}
                />
                <Text.Caption
                  tone="secondary"
                  value={t("investment.form.asset.currencyHint")}
                />
              </View>
              {vm.pickedQuote ? (
                <Card padding="sm" testID={ids.quoteBox}>
                  <Text.Caption
                    tone="secondary"
                    value={t("investment.ticker.currentQuote")}
                  />
                  <Text.Heading
                    tabular
                    value={formatUnitPrice(
                      vm.pickedQuote.price,
                      vm.pickedQuote.currency,
                      localeTag,
                    )}
                  />
                  {vm.pickedQuote.changePercent ? (
                    <Text.Caption
                      tabular
                      tone={resultTone(Number(vm.pickedQuote.changePercent))}
                      value={formatPercent(
                        Number(vm.pickedQuote.changePercent) / 100,
                        localeTag,
                      )}
                    />
                  ) : null}
                  <Text.Caption
                    tone="secondary"
                    value={t("investment.ticker.quoteBox")}
                  />
                </Card>
              ) : null}
              {vm.isEditing ? null : (
                <View style={styles.field}>
                  <TextField
                    error={err(vm.currentValueError)}
                    keyboardType="decimal-pad"
                    label={t("investment.form.asset.currentValue")}
                    onChangeText={vm.onCurrentValueChange}
                    testID={ids.currentValue}
                    value={vm.currentValue}
                  />
                  <Text.Caption
                    tone="secondary"
                    value={t("investment.form.asset.currentValueHint")}
                  />
                </View>
              )}
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
          <Button.Primary
            fullWidth
            label={t(
              vm.calculated
                ? "investment.fixedIncome.new.continue"
                : "investment.form.asset.save",
            )}
            loading={vm.isSaving}
            onPress={vm.onSave}
            size="lg"
            testID={ids.save}
          />
        }
        onClose={vm.onClose}
        presentation="inline"
        size="form"
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
    </>
  );
}

export default Wide;
