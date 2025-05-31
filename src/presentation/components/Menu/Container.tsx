import React from "react";
import { Menu as PaperMenu } from "react-native-paper";

interface Props {
  children: React.ReactNode;
  items: React.ReactNode;
  onDismiss: () => void;
  testID?: string;
  visible: boolean;
}

function Container(props: Props) {
  const { children, items, onDismiss, testID, visible } = props;
  return (
    <PaperMenu
      anchor={children}
      anchorPosition={"bottom"}
      mode={"flat"}
      onDismiss={onDismiss}
      testID={testID}
      visible={visible}
    >
      {items}
    </PaperMenu>
  );
}

export default Container;
