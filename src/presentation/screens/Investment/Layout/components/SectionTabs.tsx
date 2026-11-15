import { StyleSheet, View } from "react-native";

import { ColorMark, Text, Touchable } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface SectionTab {
  label: string;
  section: string;
  testID?: string;
}

export interface SectionTabsProps {
  accessibilityLabel: string;
  active: string;
  onSelect: (section: string) => void;
  tabs: SectionTab[];
  testID?: string;
}

// The two sections of the module as an underlined tab row (artboard of spec 110); two sections, so a tab row is
// enough and the shared SegmentedControl (a control, not navigation) is not used.
function SectionTabs(props: SectionTabsProps) {
  const { colors, spacing } = useKitTheme();
  const styles = StyleSheet.create({
    label: { paddingHorizontal: spacing.xs },
    root: {
      borderBottomColor: colors.border,
      borderBottomWidth: 1,
      flexDirection: "row",
      gap: spacing.md,
    },
    tab: { paddingBottom: spacing.xxs, paddingTop: spacing.xxs },
  });

  return (
    <View
      accessibilityLabel={props.accessibilityLabel}
      accessibilityRole="tablist"
      style={styles.root}
      testID={props.testID}
    >
      {props.tabs.map((tab) => {
        const active = tab.section === props.active;

        return (
          <Touchable
            accessibilityLabel={tab.label}
            accessibilityRole="tab"
            key={tab.section}
            onPress={() => props.onSelect(tab.section)}
            selected={active}
            style={styles.tab}
            testID={tab.testID}
          >
            <View style={styles.label}>
              <Text.Tab
                tone={active ? "primary" : "secondary"}
                value={tab.label}
              />
            </View>
            {active ? (
              <ColorMark
                color={colors.accent}
                height={2}
                shape="bar"
                width={24}
              />
            ) : null}
          </Touchable>
        );
      })}
    </View>
  );
}

export default SectionTabs;
