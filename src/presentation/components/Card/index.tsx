import { BlurView } from "expo-blur";
import React from "react";
import { View, ViewStyle } from "react-native";

import getStyles from "./styles";

export interface CardProps {
  children: React.ReactNode;
  customStyles?: ViewStyle;
  testID?: string;
}

function Card(props: CardProps) {
  const { styles, theme } = getStyles();

  return (
    <View style={styles.wrapper}>
      <BlurView
        intensity={theme.dark ? 20 : 40}
        style={styles.blurView}
        tint={theme.dark ? "dark" : "light"}
      >
        <View
          style={[styles.content, props.customStyles]}
          testID={props.testID}
        >
          {props.children}
        </View>
      </BlurView>
    </View>
  );
}

export default Card;
