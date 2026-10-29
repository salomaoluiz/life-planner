import React, { useState } from "react";
import ContentLoader, { Rect } from "react-content-loader/native";
import { LayoutChangeEvent, View } from "react-native";

import { getSize } from "@components/Skeleton/utils";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface Props {
  borderRadius?: number;
  height: number | string;
  width: number | string;
}

// A percentage width is a share of the container, not of the window: the container is measured so the shimmer
// never spills over the border of its card (spec 053).
function BoxSkeleton(props: Props) {
  const { colors, radius: kitRadius } = useKitTheme();
  const [measured, setMeasured] = useState<number>();

  const radius = props.borderRadius ?? kitRadius.md;

  const height = getSize(props.height, "height");
  const relative = typeof props.width === "string";
  const width = relative
    ? (measured ?? getSize(props.width, "width"))
    : getSize(props.width, "width");

  const loader = (
    <ContentLoader
      backgroundColor={colors.surfaceRaised}
      foregroundColor={colors.border}
      height={height}
      speed={1}
      testID={"skeleton-loader"}
      viewBox={`0 0 ${width} ${height}`}
      width={width}
    >
      <Rect
        height={height}
        rx={radius}
        ry={radius}
        testID={"skeleton-rect"}
        width={width}
        x="0"
        y="0"
      />
    </ContentLoader>
  );

  if (!relative) {
    return loader;
  }

  return (
    <View
      onLayout={(event: LayoutChangeEvent) =>
        setMeasured(event.nativeEvent.layout.width)
      }
      style={{ overflow: "hidden", width: props.width as `${number}%` }}
      testID="skeleton-box-container"
    >
      {loader}
    </View>
  );
}

export default BoxSkeleton;
