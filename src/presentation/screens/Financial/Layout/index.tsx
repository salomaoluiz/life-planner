import { Stack } from "expo-router";
import { View } from "react-native";

import { Screen, ScreenHeader } from "@components";

import {
  FinancialHeaderActionsProvider,
  useFinancialHeaderActionsNode,
} from "./headerActions";
import { useFinancialLayoutViewModel } from "./hooks";
import useStyles from "./styles";
import layoutTestIds from "./testIds";

function FinancialLayout() {
  return (
    <FinancialHeaderActionsProvider>
      <FinancialLayoutContent />
    </FinancialHeaderActionsProvider>
  );
}

function FinancialLayoutContent() {
  const { styles } = useStyles();
  const vm = useFinancialLayoutViewModel();
  const actions = useFinancialHeaderActionsNode();

  return (
    <Screen maxWidth={vm.maxWidth} testID={"financial-layout"}>
      <ScreenHeader
        actions={actions}
        onTitlePress={vm.onTitlePress}
        overline={vm.overline}
        testID={layoutTestIds.sectionPicker}
        title={vm.title}
        titleAccessibilityLabel={vm.titleA11yLabel}
      />
      <View style={styles.content}>
        <Stack screenOptions={{ animation: "none", headerShown: false }}>
          <Stack.Screen name={"index"} />
          <Stack.Screen name={"overview"} />
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
