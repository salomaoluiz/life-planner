import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

import { useCases } from "@application/useCases";
import { Button, Card, ConfirmDialog, Text } from "@components";
import {
  PendingPurchaseEntity,
  PurchaseStatuses,
} from "@domain/entities/stock/PurchaseEntity";
import { invalidateFetcherData, useQuery } from "@infrastructure/fetcher";
import { useTranslation, useTranslationLocale } from "@presentation/i18n";
import homeTestIds from "@screens/Home/testIds";

// Spec 120 FR 45: a purchase left open for 12 h, or waiting to be closed, reminds the user on the Home.
function PendingPurchaseBanner() {
  const { t } = useTranslation();
  const { getLocale } = useTranslationLocale();
  const [discarding, setDiscarding] = useState<PendingPurchaseEntity>();
  const pending = useQuery<PendingPurchaseEntity[]>({
    cacheKey: [useCases.getPendingPurchasesUseCase.uniqueName],
    fetch: async () => useCases.getPendingPurchasesUseCase.execute({}),
  });

  async function discard(entry: PendingPurchaseEntity) {
    await useCases.changePurchaseStatusUseCase.execute({
      action: "DISCARD",
      id: entry.id,
    });
    setDiscarding(undefined);
    await invalidateFetcherData();
  }

  if (!pending.data || pending.data.length === 0) {
    return null;
  }

  return (
    <View testID={homeTestIds.pendingPurchases}>
      {pending.data.map((entry) => (
        <Card
          key={entry.id}
          testID={`${homeTestIds.pendingPurchase}-${entry.id}`}
        >
          <Text.BodyStrong
            value={
              entry.status === PurchaseStatuses.ENDED
                ? `${t("stock.purchase.ended")} · ${entry.listName}`
                : t("stock.purchase.forgotten", {
                    market: entry.marketName,
                    when: new Date(entry.lastActivityAt).toLocaleDateString(
                      getLocale().languageTag,
                    ),
                  })
            }
          />
          <Button.Primary
            label={t("stock.purchase.close")}
            onPress={() => router.push(`/stock/purchases/${entry.id}` as never)}
            testID={`${homeTestIds.pendingPurchaseClose}-${entry.id}`}
          />
          <Button.Ghost
            label={t("stock.purchase.discard")}
            onPress={async () =>
              entry.checkedCount > 0 ? setDiscarding(entry) : discard(entry)
            }
            testID={`${homeTestIds.pendingPurchaseDiscard}-${entry.id}`}
          />
        </Card>
      ))}
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("stock.purchase.discard")}
        message={t("stock.purchase.discardConfirm", {
          count: discarding?.checkedCount ?? 0,
        })}
        onCancel={() => setDiscarding(undefined)}
        onConfirm={async () => discarding && discard(discarding)}
        testID={homeTestIds.pendingPurchaseConfirm}
        title={t("stock.purchase.discard")}
        visible={!!discarding}
      />
    </View>
  );
}

export default PendingPurchaseBanner;
