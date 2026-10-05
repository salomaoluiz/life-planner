import { StyleSheet, View } from "react-native";

import Icon from "@components/Icon";
import Text from "@components/Text";
import { getToneColors, Tone } from "@components/utils/tones";
import { useKitTheme } from "@components/utils/useKitTheme";
import toRgba from "@presentation/theme/constants/utils/rgba";

import { ensureContrast, parseColor } from "./contrast";

export interface IconTileProps {
  color?: string;
  label?: string;
  name?: string;
  size?: "lg" | "md";
  testID?: string;
  tone?: Tone;
}

const TILE = { lg: 48, md: 40 };
const CATEGORY_TINT = 0.16;

function IconTile(props: IconTileProps) {
  const { colors, radius, sizes } = useKitTheme();
  const tone = getToneColors(colors)[props.tone ?? "neutral"];
  const rgb = props.color ? parseColor(props.color) : undefined;
  const iconColor =
    rgb && props.color
      ? ensureContrast(props.color, colors.surface, colors.textPrimary)
      : tone.foreground;
  const background = rgb ? toRgba(rgb, CATEGORY_TINT) : tone.background;
  const size = TILE[props.size ?? "md"];
  const styles = StyleSheet.create({
    root: {
      alignItems: "center",
      backgroundColor: background,
      borderRadius: radius.sm,
      height: size,
      justifyContent: "center",
      width: size,
    },
  });
  const testID = props.testID;
  let content = null;

  if (props.label) {
    content = (
      <Text.BodyStrong
        color={iconColor}
        testID={testID && `${testID}-label`}
        value={Array.from(props.label)[0]}
      />
    );
  } else if (props.name) {
    content = (
      <Icon
        color={iconColor}
        name={props.name}
        size={sizes.iconMd}
        testID={testID && `${testID}-icon`}
      />
    );
  }

  return (
    <View style={styles.root} testID={testID}>
      {content}
    </View>
  );
}

export default IconTile;
