import React from "react";
import ContentLoader, { Rect } from "react-content-loader/native";

import { getSize } from "@components/Skeleton/utils";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface Props {
  borderRadius?: number;
  height: number | string;
  width: number | string;
}

function BoxSkeleton(props: Props) {
  const { colors, radius: kitRadius } = useKitTheme();

  const radius = props.borderRadius ?? kitRadius.md;

  const height = getSize(props.height, "height");
  const width = getSize(props.width, "width");

  return (
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
}

export default BoxSkeleton;
