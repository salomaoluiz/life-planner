import ContentLoader, { Circle } from "react-content-loader/native";

import { useKitTheme } from "@components/utils/useKitTheme";

interface Props {
  size: number;
}

function CircleSkeleton(props: Props) {
  const { colors } = useKitTheme();
  return (
    <ContentLoader
      backgroundColor={colors.surfaceRaised}
      foregroundColor={colors.border}
      height={props.size}
      speed={1}
      style={{
        height: props.size,
        position: "absolute",
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
