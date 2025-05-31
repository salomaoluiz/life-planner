import React from "react";
import { View } from "react-native";

import Skeleton from "@components/Skeleton";

import getStyles from "./styles";

function Loading() {
  const { styles, theme } = getStyles();

  const randomWidth = Math.floor(Math.random() * (200 - 100 + 1)) + 100;

  function Box({ width }: { width: number }) {
    return (
      <Skeleton.Box
        backgroundColor={theme.colors.onSurfaceVariant}
        borderRadius={theme.sizes.borderRadius.small}
        foregroundColor={theme.colors.surfaceVariant}
        height={26}
        width={width}
      />
    );
  }

  return (
    <View style={[styles.row, styles.container]}>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Skeleton.Circle
            backgroundColor={theme.colors.onSurfaceVariant}
            foregroundColor={theme.colors.surfaceVariant}
            size={42}
          />
        </View>
        <Box width={randomWidth} />
      </View>
      <View style={styles.row}>
        <View style={styles.iconContainer}>
          <Box width={120} />
        </View>
        <Box width={8} />
      </View>
    </View>
  );
}

export default Loading;
