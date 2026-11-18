import { View } from "react-native";

import {
  AdaptiveViewProps,
  BottomSheet,
  Button,
  Card,
  ChipGroup,
  DateField,
  ErrorState,
  FormColumns,
  SelectField,
  Text,
  TextField,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import { TranslationKeys } from "@presentation/i18n/types";
import QuantityField from "@screens/Stock/components/QuantityField";

import { StockMovementVM } from "../hooks";
import stockMovementTestIds from "../testIds";

function Wide({ vm }: AdaptiveViewProps<StockMovementVM>) {
  const { t } = useTranslation();
  const { model } = vm;
  const typeKey = vm.type.toLowerCase();

  const dateLabels = {
    clearLabel: t("common.actions.clear"),
    saveLabel: t("common.actions.save"),
    todayLabel: t("common.date.today"),
    yesterdayLabel: t("common.date.yesterday"),
  };

  function quantityText(quantity: { text: string; unitKey: TranslationKeys }) {
    return `${quantity.text} ${t(quantity.unitKey)}`;
  }

  function renderLotSelect() {
    if (!model?.showsLot) {
      return null;
    }

    return (
      <SelectField
        closeLabel={t("common.actions.close")}
        label={t("stock.movement.lot")}
        onChange={vm.onLotChange}
        options={[
          { label: t("stock.movement.lotAuto"), value: "" },
          ...model.lotOptions.map((option) => ({
            label: t(option.key, {
              date: option.date,
              quantity: quantityText(option.quantity),
            }),
            value: option.value,
          })),
        ]}
        sheetTitle={t("stock.movement.lot")}
        testID={stockMovementTestIds.lotSelect}
        value={vm.chosenLot}
      />
    );
  }

  function renderOpenPreview() {
    const preview = vm.openPreview;

    if (!preview) {
      return null;
    }

    return (
      <>
        <Text.Caption value={t("stock.movement.after")} />
        <Card testID={stockMovementTestIds.preview}>
          <Text.Caption value={t("stock.movement.before")} />
          <Text.BodyStrong value={quantityText(preview.before)} />
        </Card>
        <Card>
          <Text.BodyStrong
            value={t("stock.movement.afterOpened", {
              quantity: quantityText(preview.opened),
            })}
          />
        </Card>
        {preview.rest ? (
          <Card>
            <Text.BodyStrong
              value={t("stock.movement.afterClosed", {
                quantity: quantityText(preview.rest),
              })}
            />
          </Card>
        ) : null}
      </>
    );
  }

  const openedDate = model?.nextOpenExpiration?.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "2-digit",
  });

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        <Button.Primary
          fullWidth
          label={t(`stock.movement.confirm.${typeKey}` as TranslationKeys)}
          loading={vm.isSaving}
          onPress={vm.onSave}
          size="lg"
          testID={stockMovementTestIds.saveButton}
        />
      }
      onClose={vm.onClose}
      presentation="inline"
      size="form"
      testID={stockMovementTestIds.sheet}
      title={t(`stock.movement.title.${typeKey}` as TranslationKeys, {
        name: model?.description ?? "",
      })}
      visible
    >
      {vm.isLoading ? <Skeleton.ListItem /> : null}
      {vm.loadErrorKey ? (
        <ErrorState
          message={t(vm.loadErrorKey)}
          onRetry={vm.onRetry}
          retryLabel={t("common.actions.tryAgain")}
        />
      ) : null}
      {model && vm.input ? (
        <View>
          <FormColumns
            left={
              <>
                <QuantityField
                  error={vm.quantityError ? t(vm.quantityError) : undefined}
                  helper={
                    vm.type === "OPEN"
                      ? t("stock.movement.openHint")
                      : undefined
                  }
                  input={vm.input}
                  label={t(model.quantityLabelKey)}
                  onChange={vm.onQuantityChange}
                  testID={stockMovementTestIds.quantityInput}
                  unit={model.unit}
                />
                {renderLotSelect()}
                {model.showsReason ? (
                  <ChipGroup
                    label={t("stock.movement.reason")}
                    mode="single"
                    onChange={vm.onReasonChange}
                    options={model.reasonOptions.map((option) => ({
                      label: t(option.labelKey),
                      value: option.value,
                    }))}
                    testID={stockMovementTestIds.reason}
                    value={vm.chosenReason}
                  />
                ) : null}
                {model.showsExpiration ? (
                  <View>
                    <DateField
                      clearable
                      {...dateLabels}
                      label={t("stock.form.expiration")}
                      onChange={vm.setExpirationDate}
                      testID={stockMovementTestIds.expiration}
                      value={vm.expirationDate}
                    />
                    <DateField
                      clearable
                      {...dateLabels}
                      label={t("stock.form.purchase")}
                      onChange={vm.setPurchaseDate}
                      value={vm.purchaseDate}
                    />
                  </View>
                ) : null}
                <TextField
                  label={t("stock.movement.note")}
                  onChangeText={vm.onNoteChange}
                  testID={stockMovementTestIds.note}
                  value={vm.note}
                />
                {vm.errorKey ? (
                  <Text.Caption
                    testID={stockMovementTestIds.error}
                    tone="expense"
                    value={t(vm.errorKey)}
                  />
                ) : null}
              </>
            }
            right={
              vm.type === "OPEN" ? (
                <>
                  {model.hasOpenLot && openedDate ? (
                    <Card testID={stockMovementTestIds.alreadyOpen}>
                      <Text.Body
                        value={t("stock.movement.alreadyOpen", {
                          date: openedDate,
                        })}
                      />
                    </Card>
                  ) : null}
                  {renderOpenPreview()}
                </>
              ) : null
            }
            testID={stockMovementTestIds.sheet}
          />
        </View>
      ) : null}
    </BottomSheet>
  );
}

export default Wide;
