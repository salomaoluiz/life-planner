import {
  AdaptiveViewProps,
  BottomSheet,
  IconTile,
  ListItem,
} from "@components";

import { QuickAddVM } from "../hooks";

function Wide({ vm }: AdaptiveViewProps<QuickAddVM>) {
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
          inset
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

export default Wide;
