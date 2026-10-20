import { BottomTabBarProps } from "@react-navigation/bottom-tabs";

import { NavigationRail, TabBar } from "@components";

import { useAppTabBarViewModel } from "./hooks";

function AppTabBar(props: BottomTabBarProps) {
  const vm = useAppTabBarViewModel(props);

  if (vm.isWide) {
    return (
      <NavigationRail
        activeChildPath={vm.activeChildPath}
        activeRouteName={vm.activeRouteName}
        addLabel={vm.texts.addLabel}
        appName={vm.texts.appName}
        items={vm.items}
        onAddPress={vm.onAddPress}
        onChildPress={vm.onChildPress}
        onProfilePress={vm.onProfilePress}
        onTabPress={vm.onTabPress}
        profileLabel={vm.texts.profileLabel}
      />
    );
  }

  return (
    <TabBar
      activeRouteName={vm.activeRouteName}
      items={vm.items}
      onQuickAddPress={vm.onAddPress}
      onTabPress={vm.onTabPress}
      quickAddLabel={vm.texts.quickAddLabel}
    />
  );
}

export default AppTabBar;
