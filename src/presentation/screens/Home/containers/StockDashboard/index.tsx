import { useIsFocused } from "@react-navigation/native";
import { useEffect, useState } from "react";
import { View } from "react-native";

import { useCases } from "@application/useCases";
import { Spacer, Text } from "@components";
import Skeleton from "@components/Skeleton";
import { useQuery } from "@infrastructure/fetcher";
import StockDashboardViewModel from "@screens/Home/models/StockDashboardViewModel";

import getStyles from "./styles";

function StockDashboard() {
  const styles = getStyles();
  const isFocused = useIsFocused();
  const [cardWidth, setCardWidth] = useState(0);
  const dashboard = useQuery<StockDashboardViewModel>({
    cacheKey: [useCases.getStockDashboardUseCase.uniqueName],
    fetch: async () => {
      const stockDashboardDTO =
        await useCases.getStockDashboardUseCase.execute();

      return new StockDashboardViewModel({ stockDashboardDTO });
    },
  });

  useEffect(() => {
    if (isFocused) {
      dashboard.refetch();
    }
  }, [isFocused]);

  if (dashboard.isFetching || !dashboard.data) {
    return (
      <View
        onLayout={(event) => {
          setCardWidth(event.nativeEvent.layout.width);
        }}
        style={styles.containerLoading}
      >
        <Skeleton.Box height={100} width={cardWidth} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <Text.Title value={"Stock Dashboard"} />
      </View>
      <Spacer direction={"vertical"} size={"small"} />
      <Text.Body value={`Total items: ${dashboard.data.itemQuantity}`} />
      <Spacer direction={"vertical"} size={"xxsmall"} />
      <Text.Body value={`Expired items: ${dashboard.data.expiredItems}`} />
    </View>
  );
}

export default StockDashboard;
