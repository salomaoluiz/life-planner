import React from "react";
import * as Paper from "react-native-paper";

import { FabProps } from "@components/Fab/Fab";

export interface FabGroupProps {
  actions: FabProps[];
  children: React.ReactElement | React.ReactElement[];
  icon: string;
  isOpen: boolean;
  onStateChange: (state: { open: boolean }) => void;
  visible?: boolean;
}

function FabGroup(props: FabGroupProps) {
  return (
    <Paper.FAB.Group
      actions={props.actions}
      icon={props.icon}
      onStateChange={props.onStateChange}
      open={props.isOpen}
      visible={props.visible ?? true}
    />
  );
}

export default FabGroup;
