import { View } from "react-native";

import {
  AdaptiveViewProps,
  BottomSheet,
  Button,
  ChipGroup,
  ConfirmDialog,
  ErrorState,
  FormColumns,
  SelectField,
  Text,
  TextField,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import { translateChoices } from "@screens/Financial/models/ownerOptions";
import investmentTestIds from "@screens/Investment/testIds";

import { AssetModalVM } from "../hooks";
import useStyles from "../styles";

const ids = investmentTestIds.modal.asset;

function Wide({ vm }: AdaptiveViewProps<AssetModalVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();

  function err(key?: TranslationKeys) {
    return key ? t(key) : undefined;
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
              <View style={styles.field}>
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
              </View>
              <TextField
                error={err(vm.nameError)}
                label={t("investment.form.asset.name")}
                maxLength={100}
                onChangeText={vm.onNameChange}
                testID={ids.name}
                value={vm.name}
              />
            </>
          }
          right={
            <>
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
                  disabled={vm.classLocked}
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
            label={t("investment.form.asset.save")}
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
