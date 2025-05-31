import React from "react";
import { View } from "react-native";

import Skeleton from "@components/Skeleton";

import getStyles from "./styles";

function Loading() {
  const { styles, theme } = getStyles();

  return (
    <View style={styles.container}>
      <View style={styles.category}>
        <View style={styles.subCategory}>
          <Skeleton.Box
            backgroundColor={theme.colors.onSurfaceVariant}
            foregroundColor={theme.colors.surfaceVariant}
            height={74}
            width={"98%"}
          />
          <Skeleton.Box
            backgroundColor={theme.colors.onSurfaceVariant}
            foregroundColor={theme.colors.surfaceVariant}
            height={74}
            width={"96%"}
          />
        </View>
        <Skeleton.Box
          backgroundColor={theme.colors.onSurfaceVariant}
          foregroundColor={theme.colors.surfaceVariant}
          height={74}
          width={"98%"}
        />
      </View>
    </View>
  );
}

export default Loading;
