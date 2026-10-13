import { BottomSheet, IconTile, ListItem } from "@components";

import { useQuickAddViewModel } from "./hooks";

function QuickAdd() {
  const vm = useQuickAddViewModel();

  return (
    <BottomSheet
      closeLabel={vm.closeLabel}
      onClose={vm.onClose}
      presentation={"inline"}
      testID={"quick-add-sheet"}
      title={vm.title}
      visible
    >
      {vm.options.map((option) => (
        <ListItem
          key={option.testID}
          leading={<IconTile name={option.icon} tone={"accent"} />}
          onPress={option.onPress}
          testID={option.testID}
          title={option.title}
        />
      ))}
    </BottomSheet>
  );
}

export default QuickAdd;
