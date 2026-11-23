import { View } from "react-native";

import {
  AdaptiveViewProps,
  BottomSheet,
  Button,
  Card,
  ChipGroup,
  FormColumns,
  StatusBanner,
  Text,
  TextField,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";

import { StartPurchaseVM } from "../hooks";
import useStyles from "../styles";
import testIds from "../testIds";

function Wide({ vm }: AdaptiveViewProps<StartPurchaseVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        <Button.Primary
          disabled={
            vm.saving || (vm.creatingMarket && vm.name.trim().length === 0)
          }
          label={t("stock.purchase.start")}
          onPress={vm.onStart}
          testID={testIds.submit}
        />
      }
      footerSecondary={
        <Button.Secondary
          label={t("common.actions.cancel")}
          onPress={vm.onClose}
          testID={testIds.cancel}
        />
      }
      onClose={vm.onClose}
      presentation="inline"
      size="form"
      testID={testIds.sheet}
      title={t("stock.purchase.startTitle", { list: vm.listName })}
      visible
    >
      {vm.isLoading ? (
        <Skeleton.ListItem />
      ) : (
        <FormColumns
          left={
            <View style={styles.column}>
              {vm.open.length > 0 ? (
                <Text.BodyStrong value={t("stock.purchase.openPurchases")} />
              ) : null}
              {vm.open.map((entry) => (
                <Card key={entry.id}>
                  <Button.Secondary
                    label={t("stock.purchase.join", {
                      market: entry.marketName,
                      name: entry.startedBy,
                    })}
                    onPress={() => vm.onJoin(entry.purchase)}
                    testID={`${testIds.join}-${entry.id}`}
                  />
                  <Text.Caption
                    value={t("stock.purchase.cart", { count: entry.cartCount })}
                  />
                </Card>
              ))}
            </View>
          }
          right={
            <View style={styles.column}>
              <Text.BodyStrong value={t("stock.purchase.other")} />
              <ChipGroup
                label={t("stock.purchase.marketLabel")}
                mode="single"
                onChange={vm.onMarketChange}
                options={vm.marketOptions.map((option) => ({
                  label:
                    option.value === "__new__"
                      ? t("stock.purchase.marketNew")
                      : option.label,
                  value: option.value,
                }))}
                testID={testIds.market}
                value={vm.selectedMarketId}
              />
              {vm.creatingMarket ? (
                <>
                  <TextField
                    label={t("stock.purchase.marketNewName")}
                    maxLength={60}
                    onChangeText={vm.onNameChange}
                    testID={testIds.newMarketName}
                    value={vm.name}
                  />
                  <TextField
                    label={t("stock.purchase.marketNeighborhood")}
                    maxLength={60}
                    onChangeText={vm.onNeighborhoodChange}
                    testID={testIds.newMarketNeighborhood}
                    value={vm.neighborhood}
                  />
                </>
              ) : null}
              <Text.Caption value={t("stock.purchase.offlineNote")} />
              {vm.failed ? (
                <StatusBanner
                  message={t("stock.purchase.errorSave")}
                  testID={testIds.error}
                />
              ) : null}
            </View>
          }
        />
      )}
    </BottomSheet>
  );
}

export default Wide;
