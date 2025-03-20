import React, { useEffect } from "react";
import { View } from "react-native";
import Animated, {
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

import Icon from "@components/Icon";

import getStyles from "./styles";

interface Props {
  expanded: boolean;
  right?: React.ReactElement;
}

function Right(props: Props) {
  const iconRotation = useSharedValue(0);
  const styles = getStyles();

  useEffect(() => {
    if (!props.right) {
      iconRotation.set(props.expanded ? -180 : 0);
    }
  }, [props.expanded]);

  const rotatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        rotate: withSpring(`${iconRotation.value}deg`, {
          reduceMotion: ReduceMotion.System,
        }),
      },
    ],
  }));

  if (!props.right) {
    return (
      <Animated.View style={[styles.rightContainer, rotatedStyle]}>
        <Icon
          name={"chevron-down"}
          size={24}
          testID={"accordion-chevron-down"}
        />
      </Animated.View>
    );
  }

  return <View style={styles.rightContainer}>{props.right}</View>;
}

export default Right;
