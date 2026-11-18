import { AdaptiveViewProps, Button, Card, Screen, Text } from "@components";
import { useTranslation } from "@presentation/i18n";
import SectionHeader from "@screens/Stock/Layout/components/SectionHeader";

import { StockCatalogScreenVM } from "../hooks";
import stockCatalogScreenTestIds from "../testIds";

function Wide({ vm }: AdaptiveViewProps<StockCatalogScreenVM>) {
  const { t } = useTranslation();

  return (
    <Screen scroll testID={stockCatalogScreenTestIds.screen}>
      <SectionHeader section="catalog" />
      <Card>
        <Text.Body value={t("stock.sections.catalogBody")} />
        <Button.Primary
          label={t("stock.catalog.open")}
          onPress={vm.onOpenCatalog}
          testID={stockCatalogScreenTestIds.open}
        />
      </Card>
    </Screen>
  );
}

export default Wide;
