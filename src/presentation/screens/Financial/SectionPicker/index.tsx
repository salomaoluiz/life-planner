import { BottomSheet, Icon, IconTile, ListItem } from "@components";
import { useTheme } from "@presentation/theme";

import { useSectionPickerViewModel } from "./hooks";
import sectionPickerTestIds from "./testIds";

function SectionPicker() {
  const vm = useSectionPickerViewModel();
  const { theme } = useTheme();

  return (
    <BottomSheet
      closeLabel={vm.closeLabel}
      onClose={vm.onClose}
      presentation={"inline"}
      testID={sectionPickerTestIds.sheet}
      title={vm.title}
      visible
    >
      {vm.options.map((option) => (
        <ListItem
          inset
          key={option.section}
          leading={
            <IconTile
              name={option.icon}
              tone={option.selected ? "accent" : "neutral"}
            />
          }
          onPress={option.onPress}
          selected={option.selected}
          testID={option.testID}
          title={option.title}
          trailing={
            option.selected ? (
              <Icon color={theme.colors.accentText} name={"check"} size={20} />
            ) : undefined
          }
        />
      ))}
    </BottomSheet>
  );
}

export default SectionPicker;
