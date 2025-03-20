import React from "react";
import { View } from "react-native";
import { List } from "react-native-paper";

import Text from "@components/Text";

import getStyles from "./styles";

interface Props {
  id: string;
  left?: React.ReactElement;
  onPress?: () => void;
  right?: React.ReactElement;
  title: string;
}

function Item(props: Props) {
  const styles = getStyles();

  function rightFunction() {
    return <View style={styles.rightContainer}>{props.right}</View>;
  }

  function leftFunction() {
    return <View style={styles.leftContainer}>{props.left}</View>;
  }

  function Title() {
    return <Text.Title value={props.title} />;
  }

  return (
    <List.Item
      disabled={!props.onPress}
      id={props.id}
      left={leftFunction}
      onPress={props.onPress}
      right={rightFunction}
      style={styles.container}
      title={Title}
    />
  );
}

export default Item;
