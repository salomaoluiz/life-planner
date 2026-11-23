import { View } from "react-native";

import {
  AdaptiveViewProps,
  AmountInput,
  AmountText,
  Button,
  Card,
  ChipGroup,
  Screen,
  StatusBanner,
  Stepper,
  Text,
  TextField,
} from "@components";
import Skeleton from "@components/Skeleton";
import { PurchaseRowEntity } from "@domain/entities/stock/PurchaseEntity";
import { useTranslation } from "@presentation/i18n";

import { PurchaseCloseVM } from "../hooks";
import useStyles from "../styles";
import testIds from "../testIds";

function Wide({ vm }: AdaptiveViewProps<PurchaseCloseVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();

  function priceRows() {
    const asked = vm.rows.filter(
      (row) => vm.missingPrices.has(row.id) || vm.unknownWeight.has(row.id),
    );

    return asked.map((row: PurchaseRowEntity) => (
      <View
        key={row.id}
        style={styles.row}
        testID={`${testIds.priceRow}-${row.id}`}
      >
        <Text.BodyStrong value={row.description} />
        {vm.unknownWeight.has(row.id) ? (
          <TextField
            keyboardType="decimal-pad"
            label={t("stock.close.weight", { unit: row.unit ?? "" })}
            onChangeText={(value) => vm.onWeightChange(row.id, value)}
            testID={`${testIds.weight}-${row.id}`}
            value={vm.edits[row.id]?.weight ?? ""}
          />
        ) : null}
        <AmountInput
          currency={vm.currency}
          label={t("stock.purchase.price")}
          onChange={(cents) => vm.onPriceChange(row.id, cents)}
          value={vm.edits[row.id]?.priceCents ?? 0}
        />
        <Button.Secondary
          label={t("stock.close.unknownPrice")}
          onPress={() => vm.onUnknownToggle(row.id)}
          testID={`${testIds.unknown}-${row.id}`}
        />
      </View>
    ));
  }

  function stepPrices() {
    const { breakdown } = vm;

    return (
      <View style={styles.column}>
        <AmountInput
          currency={vm.currency}
          label={t("stock.close.receiptTotal")}
          onChange={vm.onReceiptChange}
          testID={testIds.receiptTotal}
          value={vm.receiptTotalCents}
        />
        <Text.Caption value={t("stock.close.receiptHint")} />
        {vm.missingPrices.size > 0 || vm.unknownWeight.size > 0 ? (
          <Card>{priceRows()}</Card>
        ) : null}
        <Card>
          <View style={styles.totals}>
            <View>
              <Text.Caption value={t("stock.close.sum")} />
              <AmountText
                currency={vm.currency}
                size="body"
                value={breakdown.pricedSumCents}
              />
            </View>
            <View>
              <Text.Caption
                value={t(
                  breakdown.mode === "UNKNOWN_PART"
                    ? "stock.close.noPricePart"
                    : "stock.close.difference",
                )}
              />
              <AmountText
                currency={vm.currency}
                size="body"
                value={breakdown.differenceCents}
              />
            </View>
          </View>
        </Card>
      </View>
    );
  }

  function stepNewItems() {
    return (
      <View style={styles.column}>
        <Text.Caption value={t("stock.close.newItemHint")} />
        {vm.newItems.map((item) => (
          <Card key={item.rowId}>
            <Text.BodyStrong value={item.description} />
            {item.suggestion ? (
              <Button.Secondary
                label={`${t("stock.close.isThis")}: ${item.suggestion.description}`}
                onPress={() =>
                  vm.onMatch(
                    item.rowId,
                    vm.matches[item.rowId]
                      ? undefined
                      : item.suggestion?.itemId,
                  )
                }
                testID={`${testIds.isThis}-${item.rowId}`}
              />
            ) : null}
            <Text.Caption
              value={
                vm.matches[item.rowId]
                  ? t("stock.close.isThis")
                  : t("stock.close.skip")
              }
            />
          </Card>
        ))}
      </View>
    );
  }

  function stepExpirations() {
    return (
      <View style={styles.column}>
        {vm.expirations.map((expiration) => {
          const row = vm.rows.find(
            (candidate) => candidate.id === expiration.rowId,
          );

          return (
            <Card key={expiration.rowId}>
              <Text.BodyStrong value={row?.description ?? ""} />
              <Button.Secondary
                label={`${expiration.suggestedDate}${vm.accepted[expiration.rowId] ? " ✓" : ""}`}
                onPress={() => vm.onExpirationToggle(expiration.rowId)}
                testID={`${testIds.expirationAccept}-${expiration.rowId}`}
              />
              <Text.Caption value={t("stock.close.skip")} />
            </Card>
          );
        })}
      </View>
    );
  }

  function stepPayment() {
    return (
      <View style={styles.column}>
        <Text.BodyStrong value={t("stock.close.paidWith")} />
        <ChipGroup
          label={t("stock.close.paidWith")}
          mode="single"
          onChange={(value) => {
            const [type, id] = value.split(":");

            vm.onSourceChange({ id, type: type as "ACCOUNT" | "CARD" });
          }}
          options={[
            ...vm.accountOptions.map((account) => ({
              label: account.name,
              value: `ACCOUNT:${account.id}`,
            })),
            ...vm.cardOptions.map((card) => ({
              label: card.title,
              value: `CARD:${card.id}`,
            })),
          ]}
          testID={testIds.accountOption}
          value={vm.source ? `${vm.source.type}:${vm.source.id}` : undefined}
        />
        <TextField
          label={t("stock.close.date")}
          onChangeText={vm.onDateChange}
          testID={testIds.date}
          value={vm.dateText}
        />
        {vm.needsDefault ? (
          <>
            <Text.Caption value={t("stock.close.defaultCategoryHint")} />
            <ChipGroup
              label={t("stock.close.defaultCategory")}
              mode="single"
              onChange={vm.onDefaultCategoryChange}
              options={vm.expenseCategories.map((category) => ({
                label: category.name,
                value: category.id,
              }))}
              testID={testIds.defaultCategory}
              value={vm.defaultCategoryId}
            />
          </>
        ) : null}
        <Card>
          <View testID={testIds.parts}>
            <Text.BodyStrong value={t("stock.close.partsTitle")} />
            {(vm.previewParts ?? []).map((part, index) => (
              <View key={`${part.kind}-${part.categoryId ?? ""}-${index}`}>
                <Text.Caption value={partLabel(part)} />
                <AmountText
                  currency={vm.currency}
                  size="body"
                  value={part.valueCents}
                />
              </View>
            ))}
          </View>
        </Card>
      </View>
    );
  }

  function partLabel(part: { categoryId?: string; kind: string }) {
    if (part.kind === "ADJUSTMENT") {
      return t("stock.close.difference");
    }

    if (part.kind === "NO_PRICE") {
      return t("stock.close.noPricePart");
    }

    return (
      vm.expenseCategories.find((category) => category.id === part.categoryId)
        ?.name ?? ""
    );
  }

  function renderStep() {
    const bodies = {
      expirations: stepExpirations,
      newItems: stepNewItems,
      payment: stepPayment,
      prices: stepPrices,
    };

    return bodies[vm.step]();
  }

  if (vm.isLoading) {
    return (
      <Screen scroll testID={testIds.screen}>
        <View testID={testIds.loading}>
          <Skeleton.ListItem />
        </View>
      </Screen>
    );
  }

  const last = vm.stepIndex === vm.steps.length - 1;

  return (
    <Screen scroll testID={testIds.screen}>
      <View style={styles.screen}>
        <Stepper
          accessibilityLabel={t("stock.close.stepOf", {
            current: vm.stepIndex + 1,
            total: vm.steps.length,
          })}
          current={vm.stepIndex}
          steps={vm.steps.map((step) => ({
            label: t(`stock.close.step.${step}`),
          }))}
          testID={testIds.step}
        />
        {vm.lockedBy ? (
          <StatusBanner
            message={t("stock.purchase.closingBy")}
            testID={testIds.locked}
          />
        ) : null}
        {renderStep()}
        {vm.errorKey ? (
          <StatusBanner message={t(vm.errorKey)} testID={testIds.error} />
        ) : null}
        <View style={styles.actions}>
          <Button.Secondary
            label={t("stock.close.back")}
            onPress={vm.onBackStep}
            testID={testIds.back}
          />
          {last ? (
            <Button.Primary
              disabled={vm.saving || vm.lockedBy || !vm.source}
              label={t("stock.close.finish")}
              onPress={vm.onFinish}
              testID={testIds.finish}
            />
          ) : (
            <Button.Primary
              label={t("stock.close.continue")}
              onPress={vm.onContinue}
              testID={testIds.continue}
            />
          )}
        </View>
      </View>
    </Screen>
  );
}

export default Wide;
