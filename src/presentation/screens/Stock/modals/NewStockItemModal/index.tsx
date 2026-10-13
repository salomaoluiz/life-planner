import { View } from "react-native";

import {
  BottomSheet,
  Button,
  ChipGroup,
  ConfirmDialog,
  DateField,
  SelectField,
  Text,
  TextField,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";

import { useNewStockItemViewModel } from "./hooks";
import useStyles from "./styles";

function NewStockItemModal() {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useNewStockItemViewModel();
  const { errors, model, values } = vm;

  const dateLabels = {
    clearLabel: t("common.actions.clear"),
    saveLabel: t("common.actions.save"),
    todayLabel: t("common.date.today"),
    yesterdayLabel: t("common.date.yesterday"),
  };

  function onQuantityChange(value: string) {
    if (/^\d*$/.test(value)) {
      vm.setField("quantity", value);
    }
  }

  function onUnitChange(value: string) {
    if (model?.isUnit(value)) {
      vm.setField("unit", value);
    }
  }

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        <Button.Primary
          fullWidth
          label={t("stock.form.save")}
          loading={vm.isSaving}
          onPress={vm.onSave}
          size="lg"
        />
      }
      onClose={vm.onClose}
      presentation="inline"
      title={t("stock.form.title")}
      visible
    >
      {vm.isLoading || !model ? (
        <Skeleton.ListItem />
      ) : (
        <View style={styles.fields}>
          <TextField
            error={errors.description ? t(errors.description) : undefined}
            label={t("stock.form.description")}
            onChangeText={(value) => vm.setField("description", value)}
            placeholder={t("stock.form.descriptionPlaceholder")}
            value={values.description}
          />
          <View style={styles.pair}>
            <View style={styles.pairItem}>
              <TextField
                error={errors.quantity ? t(errors.quantity) : undefined}
                keyboardType="number-pad"
                label={t("stock.form.quantity")}
                onChangeText={onQuantityChange}
                value={values.quantity}
              />
            </View>
            <View style={styles.pairItem}>
              <SelectField
                closeLabel={t("common.actions.close")}
                label={t("stock.form.unit")}
                onChange={onUnitChange}
                options={model.unitOptions.map((option) => ({
                  label: t(option.labelKey),
                  value: option.value,
                }))}
                sheetTitle={t("stock.form.unit")}
                value={values.unit}
              />
            </View>
          </View>
          <ChipGroup
            label={t("stock.form.owner")}
            mode="single"
            onChange={(value) => vm.setField("ownerId", value)}
            options={model.ownerOptions.map((option) => ({
              label: option.labelKey ? t(option.labelKey) : option.label,
              value: option.value,
            }))}
            value={values.ownerId ?? model.defaultOwnerId}
          />
          <DateField
            clearable
            {...dateLabels}
            label={t("stock.form.expiration")}
            onChange={(date) => vm.setField("expirationDate", date)}
            value={values.expirationDate}
          />
          <Button.Ghost
            icon={vm.isMoreOpen ? "chevron-up" : "chevron-down"}
            label={t("stock.form.moreDetails")}
            onPress={vm.onToggleMore}
          />
          {vm.isMoreOpen ? (
            <>
              <View style={styles.moreRow}>
                <View style={styles.pairItem}>
                  <DateField
                    clearable
                    {...dateLabels}
                    label={t("stock.form.purchase")}
                    onChange={(date) => vm.setField("purchaseDate", date)}
                    value={values.purchaseDate}
                  />
                </View>
                <View style={styles.pairItem}>
                  <DateField
                    clearable
                    {...dateLabels}
                    label={t("stock.form.opening")}
                    onChange={(date) => vm.setField("openingDate", date)}
                    value={values.openingDate}
                  />
                </View>
              </View>
              <View style={styles.moreRow}>
                <View style={styles.pairItem}>
                  <TextField
                    label={t("stock.form.brand")}
                    onChangeText={(value) => vm.setField("brand", value)}
                    value={values.brand}
                  />
                </View>
                <View style={styles.pairItem}>
                  <TextField
                    label={t("stock.form.barcode")}
                    onChangeText={(value) => vm.setField("barcode", value)}
                    value={values.barcode}
                  />
                </View>
              </View>
              <TextField
                label={t("stock.form.notes")}
                multiline
                onChangeText={(value) => vm.setField("notes", value)}
                value={values.notes}
              />
            </>
          ) : null}
          {vm.formErrorKey ? (
            <Text.Caption tone="expense" value={t(vm.formErrorKey)} />
          ) : null}
        </View>
      )}
      <ConfirmDialog
        cancelLabel={t("common.form.keepEditing")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("common.form.discard")}
        message={t("common.form.discardMessage")}
        onCancel={vm.onKeepEditing}
        onConfirm={vm.onDiscard}
        title={t("common.form.discardTitle")}
        visible={vm.isDiscardOpen}
      />
    </BottomSheet>
  );
}

export default NewStockItemModal;
