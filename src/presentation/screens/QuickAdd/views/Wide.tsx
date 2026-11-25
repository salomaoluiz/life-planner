import { View } from "react-native";

import {
  AdaptiveViewProps,
  BottomSheet,
  Button,
  FormColumns,
  IconTile,
  ListItem,
  SearchField,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import StockQuickOverlays from "@screens/Stock/components/StockQuickOverlays";
import StockQuickRow from "@screens/Stock/components/StockQuickRow";

import { QuickAddVM } from "../hooks";
import quickAddTestIds from "../testIds";

function Wide({ vm }: AdaptiveViewProps<QuickAddVM>) {
  const { t } = useTranslation();

  function renderStock() {
    if (vm.isLoading) {
      return <Skeleton.ListItem />;
    }

    if (vm.isEmpty) {
      return (
        <View testID={quickAddTestIds.noStockResult}>
          <Text.BodyStrong
            value={t("stock.suggestions.noMatch", { name: vm.query })}
          />
          <Text.Caption value={t("stock.suggestions.noMatchHint")} />
          <Button.Primary
            disabled={!vm.canCreateWithAi}
            icon="auto-fix"
            label={t(
              vm.searchLeft?.left === 0
                ? "stock.suggestions.backTomorrow"
                : "stock.suggestions.createWithAi",
            )}
            onPress={vm.onCreateWithAi}
            testID={quickAddTestIds.createWithAi}
          />
          <Button.Secondary
            label={t("stock.suggestions.createWithoutAi")}
            onPress={vm.onCreateFromSearch}
            testID={quickAddTestIds.createFromSearch}
          />
          {vm.searchLeft ? (
            <Text.Caption
              value={t("stock.suggestions.usageSearchLeft", vm.searchLeft)}
            />
          ) : null}
        </View>
      );
    }

    return (
      <>
        {vm.searching || vm.rows.length === 0 ? null : (
          <Text.Overline value={t("navigation.quickAdd.frequent")} />
        )}
        {vm.rows.map((item) => (
          <StockQuickRow item={item} key={item.id} quick={vm.quick} />
        ))}
      </>
    );
  }

  const create = (
    <>
      <Text.Overline value={t("navigation.quickAdd.create")} />
      {vm.options.map((option) => (
        <ListItem
          inset
          key={option.testID}
          leading={<IconTile name={option.icon} tone={"accent"} />}
          onPress={option.onPress}
          testID={option.testID}
          title={option.title}
        />
      ))}
    </>
  );

  return (
    <BottomSheet
      closeLabel={vm.closeLabel}
      onClose={vm.onClose}
      presentation={"inline"}
      size="form"
      testID={"quick-add-sheet"}
      title={vm.title}
      visible
    >
      <FormColumns
        left={
          <>
            <SearchField
              clearLabel={t("common.actions.clear")}
              onChangeText={vm.onSearchChange}
              placeholder={t("navigation.quickAdd.stockSearch")}
              testID={quickAddTestIds.stockSearch}
              value={vm.search}
            />
            <Button.Secondary
              icon="barcode-scan"
              label={t("stock.barcode.entry")}
              onPress={vm.onScanPress}
              testID={quickAddTestIds.scan}
            />
            {renderStock()}
          </>
        }
        right={create}
      />
      <StockQuickOverlays quick={vm.quick} />
    </BottomSheet>
  );
}

export default Wide;
