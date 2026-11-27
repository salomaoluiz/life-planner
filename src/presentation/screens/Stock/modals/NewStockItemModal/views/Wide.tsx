import { View } from "react-native";

import {
  AdaptiveViewProps,
  BottomSheet,
  Button,
  Card,
  CategoryTreeField,
  ChipGroup,
  ConfirmDialog,
  DateField,
  FormColumns,
  SelectField,
  Text,
  TextField,
  useTreePickerLabels,
} from "@components";
import Skeleton from "@components/Skeleton";
import {
  formatAmount,
  toDisplay,
  toQuantity,
} from "@domain/entities/stock/stockQuantity";
import { useTranslation } from "@presentation/i18n";
import QuantityField from "@screens/Stock/components/QuantityField";

import InlineScanner from "../components/InlineScanner";
import SourceBadge from "../components/SourceBadge";
import SuggestionBanner from "../components/SuggestionBanner";
import { NewStockItemVM } from "../hooks";
import useStyles from "../styles";
import stockItemFormTestIds from "../testIds";

function Wide({ vm }: AdaptiveViewProps<NewStockItemVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { catalog, errors, model, values } = vm;
  const categoryLabels = useTreePickerLabels("category", "category");
  const locationLabels = useTreePickerLabels("location", "location");

  const dateLabels = {
    clearLabel: t("common.actions.clear"),
    saveLabel: t("common.actions.save"),
    todayLabel: t("common.date.today"),
    yesterdayLabel: t("common.date.yesterday"),
  };

  function onUnitChange(value: string) {
    if (model?.isUnit(value)) {
      vm.setField("unit", value);
    }
  }

  function minHint() {
    const min = toQuantity(values.min, values.unit);

    if (min === undefined || values.stockOnly) {
      return t("stock.form.minHintEmpty");
    }

    const display = toDisplay(min, values.unit);

    return t("stock.form.minHintSet", {
      quantity: `${formatAmount(display.amount)} ${t(`common.units.${display.unitKey}` as never)}`,
    });
  }

  const quantityHint = {
    kilogram: "stock.form.quantityHintWeight",
    liter: "stock.form.quantityHintVolume",
    unit: "stock.form.quantityHintUnit",
  } as const;

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
          testID={stockItemFormTestIds.saveButton}
        />
      }
      onClose={vm.onClose}
      presentation="inline"
      size="form"
      testID={stockItemFormTestIds.sheet}
      title={t(vm.isEdit ? "stock.form.editTitle" : "stock.form.title")}
      visible
    >
      {vm.isLoading || !model ? (
        <Skeleton.ListItem />
      ) : (
        <View style={styles.fields}>
          <FormColumns
            left={
              <>
                <SuggestionBanner vm={vm} />
                <Text.Overline value={t("stock.form.itemSection")} />
                <SourceBadge field="description" vm={vm} />
                <View style={styles.descriptionRow}>
                  <View style={styles.descriptionField}>
                    <TextField
                      error={
                        errors.description ? t(errors.description) : undefined
                      }
                      label={t("stock.form.description")}
                      onChangeText={(value) =>
                        vm.setField("description", value)
                      }
                      placeholder={t("stock.form.descriptionPlaceholder")}
                      testID={stockItemFormTestIds.descriptionInput}
                      value={values.description}
                    />
                  </View>
                  <Button.Secondary
                    disabled={!vm.ai.canFillWithAi}
                    icon="auto-fix"
                    label={t(
                      vm.ai.isLimitReached
                        ? "stock.suggestions.backTomorrow"
                        : "stock.suggestions.fillWithAi",
                    )}
                    onPress={vm.ai.onFillWithAi}
                    testID={stockItemFormTestIds.fillWithAi}
                  />
                </View>
                {vm.suggestion ? (
                  <Card testID={stockItemFormTestIds.suggestion}>
                    <Text.Body
                      value={t("stock.form.suggestion.exists", {
                        name: vm.suggestion.name,
                        qty: `${vm.suggestion.quantity.text} ${t(vm.suggestion.quantity.unitKey)}`,
                      })}
                    />
                    <Button.Secondary
                      label={t("stock.form.suggestion.action")}
                      onPress={vm.onAddToSuggestion}
                      testID={stockItemFormTestIds.suggestionAction}
                    />
                  </Card>
                ) : null}
                {vm.linkName ? (
                  <Card testID={stockItemFormTestIds.linkCode}>
                    <Text.Body
                      value={t("stock.suggestions.linkCode", {
                        name: vm.linkName,
                      })}
                    />
                    <Button.Secondary
                      label={t("stock.suggestions.linkCodeAction")}
                      onPress={vm.onLinkCode}
                      testID={stockItemFormTestIds.linkCodeAction}
                    />
                  </Card>
                ) : null}
                <View style={styles.pair}>
                  <View style={styles.pairItem}>
                    <SourceBadge field="categoryId" vm={vm} />
                    <CategoryTreeField
                      archivedLabel={t("common.treePicker.archived")}
                      label={t("stock.form.category")}
                      labels={categoryLabels}
                      mode={"single"}
                      mostUsedIds={catalog?.mostUsedCategoryIds}
                      nodes={catalog?.categoryNodes ?? []}
                      onChange={(id) => vm.setField("categoryId", id)}
                      testID={stockItemFormTestIds.categorySelect}
                      value={values.categoryId}
                    />
                  </View>
                  <View style={styles.pairItem}>
                    <SourceBadge field="locationId" vm={vm} />
                    <CategoryTreeField
                      archivedLabel={t("common.treePicker.archived")}
                      label={t("stock.form.location")}
                      labels={locationLabels}
                      mode={"single"}
                      mostUsedIds={catalog?.mostUsedLocationIds}
                      nodes={catalog?.locationNodes ?? []}
                      onChange={(id) => vm.setField("locationId", id)}
                      testID={stockItemFormTestIds.locationSelect}
                      value={values.locationId}
                    />
                  </View>
                </View>
                {values.stockOnly ? null : (
                  <SelectField
                    closeLabel={t("common.actions.close")}
                    label={t("stock.form.shoppingList")}
                    onChange={(value) =>
                      vm.setField("shoppingListId", value || undefined)
                    }
                    options={[
                      {
                        label: t("stock.form.shoppingListDefault", {
                          name:
                            catalog?.defaultListName ??
                            t("stock.lists.defaultName"),
                        }),
                        value: "",
                      },
                      ...(catalog?.shoppingLists ?? []),
                    ]}
                    sheetTitle={t("stock.form.shoppingList")}
                    testID={stockItemFormTestIds.shoppingListSelect}
                    value={values.shoppingListId ?? ""}
                  />
                )}
                <SourceBadge field="unit" vm={vm} />
                <ChipGroup
                  label={t("stock.form.unit")}
                  mode="single"
                  onChange={onUnitChange}
                  options={model.unitOptions.map((option) => ({
                    label: t(option.labelKey),
                    value: option.value,
                  }))}
                  testID={stockItemFormTestIds.unitSelect}
                  value={values.unit}
                />
                <View style={styles.pair}>
                  <View style={styles.pairItem}>
                    <QuantityField
                      input={values.min}
                      label={t("stock.form.min")}
                      onChange={(input) => vm.setField("min", input)}
                      testID={stockItemFormTestIds.minInput}
                      unit={values.unit}
                    />
                  </View>
                  <View style={styles.pairItem}>
                    <QuantityField
                      error={errors.ideal ? t(errors.ideal) : undefined}
                      input={values.ideal}
                      label={t("stock.form.ideal")}
                      onChange={(input) => vm.setField("ideal", input)}
                      testID={stockItemFormTestIds.idealInput}
                      unit={values.unit}
                    />
                  </View>
                </View>
                <Text.Caption value={minHint()} />
                <ChipGroup
                  mode="multiple"
                  onChange={(selected) =>
                    vm.setField("stockOnly", selected.includes("stockOnly"))
                  }
                  options={[
                    { label: t("stock.form.stockOnly"), value: "stockOnly" },
                  ]}
                  testID={stockItemFormTestIds.stockOnly}
                  value={values.stockOnly ? ["stockOnly"] : []}
                />
              </>
            }
            right={
              <>
                {vm.isEdit ? (
                  <Text.Caption value={t("stock.form.quantityEditHint")} />
                ) : (
                  <>
                    <Text.Overline value={t("stock.form.firstLotSection")} />
                    {vm.ai.packageHint ? (
                      <Text.Caption
                        testID={stockItemFormTestIds.packageHint}
                        value={t("stock.suggestions.packageHint", {
                          quantity: `${vm.ai.packageHint.text} ${t(vm.ai.packageHint.unitKey as never)}`,
                        })}
                      />
                    ) : null}
                    <QuantityField
                      error={errors.quantity ? t(errors.quantity) : undefined}
                      helper={t(quantityHint[values.unit])}
                      input={values.quantity}
                      label={t("stock.form.quantity")}
                      onChange={(input) => vm.setField("quantity", input)}
                      testID={stockItemFormTestIds.quantityInput}
                      unit={values.unit}
                    />
                    <View style={styles.pair}>
                      <View style={styles.pairItem}>
                        <DateField
                          clearable
                          {...dateLabels}
                          label={t("stock.form.expiration")}
                          onChange={(date) =>
                            vm.setField("expirationDate", date)
                          }
                          testID={stockItemFormTestIds.expirationField}
                          value={values.expirationDate}
                        />
                      </View>
                      <View style={styles.pairItem}>
                        <DateField
                          clearable
                          {...dateLabels}
                          label={t("stock.form.purchase")}
                          onChange={(date) => vm.setField("purchaseDate", date)}
                          value={values.purchaseDate}
                        />
                      </View>
                    </View>
                  </>
                )}
                <Button.Ghost
                  icon={vm.isMoreOpen ? "chevron-up" : "chevron-down"}
                  inline
                  label={t("stock.form.moreDetails")}
                  onPress={vm.onToggleMore}
                  testID={stockItemFormTestIds.moreToggle}
                />
                {vm.isMoreOpen ? (
                  <>
                    <View style={styles.moreRow}>
                      <View style={styles.pairItem}>
                        <SourceBadge field="brand" vm={vm} />
                        <TextField
                          label={t("stock.form.brand")}
                          onChangeText={(value) => vm.setField("brand", value)}
                          testID={stockItemFormTestIds.brandInput}
                          value={values.brand}
                        />
                      </View>
                      <View style={styles.pairItem}>
                        <SourceBadge field="openedShelfLifeDays" vm={vm} />
                        <TextField
                          error={
                            errors.shelfLife ? t(errors.shelfLife) : undefined
                          }
                          keyboardType="number-pad"
                          label={t("stock.form.shelfLife")}
                          onChangeText={(value) =>
                            vm.setField(
                              "openedShelfLifeDays",
                              value.replace(/\D/g, ""),
                            )
                          }
                          testID={stockItemFormTestIds.shelfLifeInput}
                          value={values.openedShelfLifeDays}
                        />
                      </View>
                    </View>
                    <View style={styles.moreRow}>
                      <View style={styles.pairItem}>
                        <TextField
                          error={
                            errors.warnClosed ? t(errors.warnClosed) : undefined
                          }
                          keyboardType="number-pad"
                          label={t("stock.form.warnClosed")}
                          onChangeText={(value) =>
                            vm.setField(
                              "warnDaysClosed",
                              value.replace(/\D/g, ""),
                            )
                          }
                          testID={stockItemFormTestIds.warnClosedInput}
                          value={values.warnDaysClosed}
                        />
                      </View>
                      <View style={styles.pairItem}>
                        <TextField
                          error={
                            errors.warnOpened ? t(errors.warnOpened) : undefined
                          }
                          keyboardType="number-pad"
                          label={t("stock.form.warnOpened")}
                          onChangeText={(value) =>
                            vm.setField(
                              "warnDaysOpened",
                              value.replace(/\D/g, ""),
                            )
                          }
                          testID={stockItemFormTestIds.warnOpenedInput}
                          value={values.warnDaysOpened}
                        />
                      </View>
                    </View>
                    <QuantityField
                      error={errors.step ? t(errors.step) : undefined}
                      helper={t("stock.quick.stepHint")}
                      input={values.step}
                      label={t("stock.quick.step")}
                      onChange={(input) => vm.setField("step", input)}
                      testID={stockItemFormTestIds.stepInput}
                      unit={values.unit}
                    />
                    <TextField
                      label={t("stock.form.barcode")}
                      onChangeText={(value) => vm.setField("barcode", value)}
                      testID={stockItemFormTestIds.barcodeInput}
                      value={values.barcode}
                    />
                    {vm.barcodeField.isScanning ? (
                      <InlineScanner
                        onClose={vm.barcodeField.onClose}
                        onScanned={vm.barcodeField.onScanned}
                      />
                    ) : (
                      <Button.Ghost
                        icon="barcode-scan"
                        inline
                        label={t("stock.barcode.scanField")}
                        onPress={vm.barcodeField.onOpen}
                        testID={stockItemFormTestIds.scanBarcode}
                      />
                    )}
                    {vm.barcodeField.inUse ? (
                      <Card testID={stockItemFormTestIds.barcodeInUse}>
                        <Text.Body
                          value={t("stock.barcode.inUse", {
                            name: vm.barcodeField.inUse.description,
                          })}
                        />
                        <Button.Secondary
                          label={t("stock.barcode.openItem")}
                          onPress={vm.onOpenExistingItem}
                          testID={stockItemFormTestIds.barcodeInUseAction}
                        />
                      </Card>
                    ) : null}
                    <ChipGroup
                      label={t("stock.form.owner")}
                      mode="single"
                      onChange={vm.onOwnerChange}
                      options={model.ownerOptions.map((option) => ({
                        label: option.labelKey
                          ? t(option.labelKey)
                          : option.label,
                        value: option.value,
                      }))}
                      testID={stockItemFormTestIds.owner}
                      value={values.ownerId ?? model.defaultOwnerId}
                    />
                    {vm.ownerChangePreview ? (
                      <Card testID={stockItemFormTestIds.ownerChange}>
                        <Text.BodyStrong
                          value={t("stock.form.ownerChange.title")}
                        />
                        {renderOwnerChange()}
                      </Card>
                    ) : null}
                    <TextField
                      label={t("stock.form.notes")}
                      multiline
                      onChangeText={(value) => vm.setField("notes", value)}
                      testID={stockItemFormTestIds.notesInput}
                      value={values.notes}
                    />
                  </>
                ) : null}
              </>
            }
            testID={stockItemFormTestIds.sheet}
          />
          {vm.ai.usage && !vm.isEdit ? (
            <Text.Caption
              testID={stockItemFormTestIds.usage}
              value={t("stock.suggestions.usage", {
                light: vm.ai.usage.light.used,
                lightLimit: vm.ai.usage.light.limit,
                search: vm.ai.usage.search.used,
                searchLimit: vm.ai.usage.search.limit,
              })}
            />
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

  // What happens to the category and the location when the owner changes (FR 27).
  function renderOwnerChange() {
    const preview = vm.ownerChangePreview;
    const owner = model?.ownerName(values.ownerId ?? "") ?? "";

    if (!preview) {
      return null;
    }

    return (
      <>
        {preview.category.from ? (
          <Text.Caption
            value={t(
              preview.category.to
                ? "stock.form.ownerChange.keepsCategory"
                : "stock.form.ownerChange.noCategory",
              { name: preview.category.from, owner },
            )}
          />
        ) : null}
        {preview.location.from ? (
          <Text.Caption
            value={t(
              preview.location.to
                ? "stock.form.ownerChange.keepsLocation"
                : "stock.form.ownerChange.noLocation",
              { name: preview.location.from, owner },
            )}
          />
        ) : null}
        {preview.shoppingList.from ? (
          <Text.Caption
            value={t(
              preview.shoppingList.to
                ? "stock.form.ownerChange.keepsList"
                : "stock.form.ownerChange.noList",
              { name: preview.shoppingList.from, owner },
            )}
          />
        ) : null}
      </>
    );
  }
}

export default Wide;
