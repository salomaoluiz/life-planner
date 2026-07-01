import * as React from "react";
import { Menu as PaperMenu } from "react-native-paper";

export interface MenuProps {
  anchor: React.ReactNode;
  children: React.ReactNode;
  onDismiss: () => void;
  visible: boolean;
}

function Menu({ anchor, children, onDismiss, visible }: MenuProps) {
  return (
    <PaperMenu anchor={anchor} onDismiss={onDismiss} visible={visible}>
      {children}
    </PaperMenu>
  );
}

export default Menu;
