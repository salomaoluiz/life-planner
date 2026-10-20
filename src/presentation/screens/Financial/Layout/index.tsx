import { Stack } from "expo-router";
import { View } from "react-native";

import { Screen, ScreenHeader, SegmentedControl } from "@components";

import { useFinancialLayoutViewModel } from "./hooks";
import useStyles from "./styles";
import layoutTestIds from "./testIds";

function FinancialLayout() {
  const { styles } = useStyles();
  const vm = useFinancialLayoutViewModel();

  return (
    <Screen testID={"financial-layout"}>
      <ScreenHeader title={vm.title} />
      <SegmentedControl
        accessibilityLabel={vm.title}
        onChange={vm.onSectionChange}
        options={vm.options}
        testID={layoutTestIds.segments}
        value={vm.section}
      />
      <View style={styles.content}>
        <Stack screenOptions={{ animation: "none", headerShown: false }}>
          <Stack.Screen name={"index"} />
          <Stack.Screen name={"categories"} />
          <Stack.Screen name={"accounts"} />
          <Stack.Screen name={"cards"} />
          <Stack.Screen name={"tags"} />
        </Stack>
      </View>
    </Screen>
  );
}

export default FinancialLayout;
