export interface TabBarItem {
  icon: string;
  label: string;
  routeName: string;
  testID: string;
}

export interface TabBarProps {
  activeRouteName: string;
  items: TabBarItem[];
  onQuickAddPress: () => void;
  onTabPress: (routeName: string) => void;
  quickAddLabel: string;
  testID?: string;
}
