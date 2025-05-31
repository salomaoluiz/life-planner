import ContentLoader, { Circle } from "react-content-loader/native";

import { useTheme } from "@presentation/theme";

interface Props {
  backgroundColor?: string;
  foregroundColor?: string;
  size: number;
}

function CircleSkeleton(props: Props) {
  const { theme } = useTheme();
  return (
    <ContentLoader
      backgroundColor={props.backgroundColor ?? theme.colors.onSurface}
      foregroundColor={props.foregroundColor ?? theme.colors.onSurfaceVariant}
      height={props.size}
      speed={1}
      style={{
        height: props.size,
        width: props.size,
        zIndex: 1,
      }}
      testID={"skeleton-loader"}
      viewBox={`0 0 ${props.size * 2} ${props.size * 2}`}
      width={props.size}
    >
      <Circle
        cx={props.size}
        cy={props.size}
        r={props.size}
        testID={"skeleton-circle"}
      />
    </ContentLoader>
  );
}

export default CircleSkeleton;
