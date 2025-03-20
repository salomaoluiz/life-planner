import React from "react";
import ContentLoader, { Rect } from "react-content-loader/native";

import { useTheme } from "@presentation/theme";

export interface Props {
  borderRadius?: number;
  height: number;
  width: number;
}

function BoxSkeleton(props: Props) {
  const { theme } = useTheme();

  const radius = props.borderRadius ?? theme.sizes.borderRadius.medium;

  return (
    <ContentLoader
      backgroundColor={theme.colors.onSurface}
      foregroundColor={theme.colors.onSurfaceVariant}
      height={props.height}
      speed={1}
      testID={"skeleton-loader"}
      viewBox={`0 0 ${props.width} ${props.height}`}
      width={props.width}
    >
      <Rect
        height={props.height}
        rx={radius}
        ry={radius}
        testID={"skeleton-rect"}
        width={props.width}
        x="0"
        y="0"
      />
    </ContentLoader>
  );
}

export default BoxSkeleton;
