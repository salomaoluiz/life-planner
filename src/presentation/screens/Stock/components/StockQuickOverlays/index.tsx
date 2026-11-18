import { useState } from "react";
import { StyleSheet, View } from "react-native";

import {
  BottomSheet,
  Button,
  ChipGroup,
  DateField,
  ListItem,
  StatusBanner,
  Text,
  Toast,
} from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { StockLotStatus } from "@domain/entities/stock/StockLotEntity";
import {
  initialInput,
  QuantityInput,
  toQuantity,
} from "@domain/entities/stock/stockQuantity";
import { exactChips } from "@domain/entities/stock/stockQuickStep";
import { useTranslation } from "@presentation/i18n";
import QuantityField from "@screens/Stock/components/QuantityField";
import { StockQuickMovementVM } from "@screens/Stock/hooks/useStockQuickMovement";
import { formatQuantity } from "@screens/Stock/models/quantityFormat";
import stockTestIds from "@screens/Stock/testIds";

interface Props {
  quick: StockQuickMovementVM;
}

// "Sem conexão · N movimentos esperando para enviar" at the top of the stock screens (FR 22).
export function OfflineBanner({ quick }: Props) {
  const { t } = useTranslation();

  if (quick.offlineCount === 0) {
    return null;
  }

  return (
    <StatusBanner
      actionLabel={t("common.actions.tryAgain")}
      icon="cloud-off-outline"
      message={t("stock.offline.banner", { count: quick.offlineCount })}
      onAction={() => void quick.retryNow()}
      testID={stockTestIds.offlineBanner}
    />
  );
}

function ExactSheet({ quick }: Props) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const state = quick.exact;
  const [direction, setDirection] = useState<string>("-1");
  const [input, setInput] = useState<QuantityInput>({
    mode: initialInput(undefined, StockUnits.UNIT).mode,
    text: "",
  });
  const [seen, setSeen] = useState<string | undefined>();

  // A new sheet starts from its own direction and an empty field.
  if (state && seen !== `${state.item.id}:${state.direction}`) {
    setSeen(`${state.item.id}:${state.direction}`);
    setDirection(String(state.direction));
    setInput(initialInput(undefined, state.item.unit));
  } else if (!state && seen) {
    setSeen(undefined);
  }

  if (!state) {
    return null;
  }

  const { item } = state;
  const sign = direction === "1" ? 1 : -1;
  const quantity = toQuantity(input, item.unit);
  function formatted(value: number) {
    const { text, unitKey } = formatQuantity(value, item.unit);

    return item.unit === StockUnits.UNIT ? text : `${text} ${t(unitKey)}`;
  }
  const styles = StyleSheet.create({ body: { gap: spacing.md } });
  const total = item.quantity;
  const chips = exactChips(item);

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        <Button.Primary
          disabled={!quantity || quantity <= 0}
          label={t(
            sign === -1
              ? "stock.quick.exactConfirmTake"
              : "stock.quick.exactConfirmAdd",
            { quantity: quantity ? formatted(quantity) : "" },
          )}
          onPress={() => quantity && quick.onExactConfirm(sign, quantity)}
          testID={stockTestIds.exactConfirm}
        />
      }
      onClose={quick.onExactClose}
      testID={stockTestIds.exactSheet}
      title={t(
        sign === -1
          ? "stock.quick.exactTitleTake"
          : "stock.quick.exactTitleAdd",
        { name: item.description },
      )}
      visible
    >
      <View style={styles.body}>
        <ChipGroup
          mode="single"
          onChange={setDirection}
          options={[
            { label: t("stock.quick.directionTake"), value: "-1" },
            { label: t("stock.quick.directionAdd"), value: "1" },
          ]}
          testID={stockTestIds.exactDirection}
          value={direction}
        />
        <QuantityField
          input={input}
          label={t("stock.quick.exactQuantity")}
          onChange={setInput}
          testID={stockTestIds.exactInput}
          unit={item.unit}
        />
        <ChipGroup
          layout="wrap"
          mode="single"
          onChange={(value) => setInput(initialInput(Number(value), item.unit))}
          options={[
            ...chips.map((value) => ({
              label: formatted(value),
              value: String(value),
            })),
            {
              label: t("stock.quick.all", { quantity: formatted(total) }),
              value: String(total),
            },
          ]}
          testID={`${stockTestIds.exactSheet}-chips`}
        />
      </View>
    </BottomSheet>
  );
}

function ExpirationSheet({ quick }: Props) {
  const { t } = useTranslation();
  const [date, setDate] = useState<Date | undefined>();

  if (!quick.expirationFor) {
    return null;
  }

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        <Button.Primary
          disabled={!date}
          label={t("common.actions.save")}
          onPress={() => {
            if (date) {
              void quick.onExpirationSave(date);
              setDate(undefined);
            }
          }}
          testID={stockTestIds.expirationSave}
        />
      }
      onClose={quick.onExpirationClose}
      testID={stockTestIds.expirationSheet}
      title={t("stock.quick.expirationTitle")}
      visible
    >
      <DateField
        label={t("stock.quick.expiration")}
        onChange={setDate}
        saveLabel={t("common.actions.save")}
        testID="stock.notice.expiration-date"
        value={date}
      />
    </BottomSheet>
  );
}

function ExpiredPrompt({ quick }: Props) {
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const prompt = quick.expiredPrompt;

  if (!prompt) {
    return null;
  }

  const hasValid = quick.hasExpiredValidLot(prompt.lots);
  const loaded = prompt.lots !== undefined;
  const options = [
    ...(hasValid || !loaded
      ? ([
          ["DISCARD_THEN_VALID", "stock.expired.discardThenValid"],
          ["VALID_ONLY", "stock.expired.validOnly"],
        ] as const)
      : ([["DISCARD_THEN_VALID", "stock.expired.discardOnly"]] as const)),
    ["EXPIRED_FIRST", "stock.expired.expiredFirst"] as const,
  ];
  const styles = StyleSheet.create({
    lots: { gap: spacing.xs },
  });

  return (
    <BottomSheet
      closeLabel={t("stock.expired.cancel")}
      onClose={quick.onExpiredCancel}
      testID={stockTestIds.expiredSheet}
      title={t("stock.expired.title", { name: prompt.item.description })}
      visible
    >
      {options.map(([choice, key]) => (
        <ListItem
          inset
          key={choice}
          onPress={() => quick.onChooseExpired(choice)}
          testID={`${stockTestIds.expiredOption}-${choice}`}
          title={t(key)}
        />
      ))}
      <View style={styles.lots}>
        {(prompt.lots ?? []).map((lot) => {
          const { text, unitKey } = formatQuantity(
            lot.quantity,
            prompt.item.unit,
          );

          return (
            <Text.Caption
              key={lot.id}
              value={`${text} ${t(unitKey)} · ${
                lot.expirationStatus === StockLotStatus.EXPIRED
                  ? t("stock.badge.expired")
                  : (lot.expirationDate?.toLocaleDateString() ??
                    t("stock.lots.noExpiration"))
              }`}
            />
          );
        })}
      </View>
      <Button.Ghost
        label={t("stock.expired.cancel")}
        onPress={quick.onExpiredCancel}
        testID={stockTestIds.expiredCancel}
      />
    </BottomSheet>
  );
}

// The notice stays while its gesture is tapped and for 6 s after it is sent; the hook owns that timer.
const NOTICE_TOAST_MS = 60_000;

function Notice({ quick }: Props) {
  const { t } = useTranslation();
  const { notice } = quick;
  const canUndo = notice?.kind === "MOVE";
  const canSetExpiration = canUndo && notice.canSetExpiration && notice.sent;

  return (
    <Toast
      actionLabel={canUndo ? t("stock.quick.undo") : undefined}
      actionTestID={stockTestIds.noticeUndo}
      durationMs={NOTICE_TOAST_MS}
      icon={notice?.kind === "MOVE" ? "check" : "alert-circle-outline"}
      message={notice?.message ?? ""}
      onAction={canUndo ? () => void quick.onUndo() : undefined}
      onHide={quick.onNoticeHide}
      onSecondaryAction={canSetExpiration ? quick.onExpirationOpen : undefined}
      secondaryActionLabel={
        canSetExpiration ? t("stock.quick.expiration") : undefined
      }
      secondaryActionTestID={stockTestIds.noticeExpiration}
      testID="stock.notice"
      visible={!!notice}
    />
  );
}

function StockQuickOverlays({ quick }: Props) {
  return (
    <>
      <Notice quick={quick} />
      <ExactSheet quick={quick} />
      <ExpiredPrompt quick={quick} />
      <ExpirationSheet quick={quick} />
    </>
  );
}

export default StockQuickOverlays;
