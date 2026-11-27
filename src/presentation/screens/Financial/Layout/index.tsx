import { Stack } from "expo-router";
import { View } from "react-native";

import { Screen, ScreenHeader } from "@components";
import NotificationBell from "@screens/Notifications/containers/NotificationBell";

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
        actions={
          <>
            {actions}
            <NotificationBell />
          </>
        }
        onTitlePress={vm.onTitlePress}
        overline={vm.overline}
        testID={layoutTestIds.sectionPicker}
        title={vm.title}
        titleAccessibilityLabel={vm.titleA11yLabel}
      />
      <View style={styles.content}>
        <Stack screenOptions={{ animation: "none", headerShown: false }}>
          <Stack.Screen name={"index"} />
          <Stack.Screen name={"transaction"} />
          <Stack.Screen name={"overview"} />
          <Stack.Screen name={"categories"} />
          <Stack.Screen name={"accounts"} />
          <Stack.Screen name={"cards"} />
          <Stack.Screen name={"tags"} />
          <Stack.Screen name={"history"} />
        </Stack>
      </View>
    </Screen>
  );
}

export default FinancialLayout;
