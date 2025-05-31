import React from "react";
import ContentLoader, { Rect } from "react-content-loader/native";

import { getSize } from "@components/Skeleton/utils";
import { useTheme } from "@presentation/theme";

export interface Props {
  backgroundColor?: string;
  borderRadius?: number;
  foregroundColor?: string;
  height: number | string;
  width: number | string;
}

function BoxSkeleton(props: Props) {
  const { theme } = useTheme();

  const radius = props.borderRadius ?? theme.sizes.borderRadius.medium;

  const height = getSize(props.height, "height");
  const width = getSize(props.width, "width");

  return (
    <ContentLoader
      backgroundColor={props.backgroundColor ?? theme.colors.onSurface}
      foregroundColor={props.foregroundColor ?? theme.colors.onSurfaceVariant}
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
