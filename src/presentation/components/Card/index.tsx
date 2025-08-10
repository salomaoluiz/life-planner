import React from "react";
import { ViewStyle } from "react-native";
import * as Paper from "react-native-paper";

export interface CardProps {
  children: React.ReactNode;
  customStyles?: ViewStyle;
  testID?: string;
}

function Card(props: CardProps) {
  return (
    <Paper.Card style={props.customStyles} testID={props.testID}>
      {props.children}
    </Paper.Card>
  );
}

export default Card;
