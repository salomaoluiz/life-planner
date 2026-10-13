import { useState } from "react";
import { Image, StyleSheet, View } from "react-native";

import Icon from "@components/Icon";
import Text from "@components/Text";
import { getToneColors } from "@components/utils/tones";
import { useKitTheme } from "@components/utils/useKitTheme";

import { getAvatarTone } from "./getAvatarTone";

export interface AvatarViewProps {
  name?: string;
  pending?: boolean;
  photoUrl?: string;
  size?: "lg" | "md" | "sm";
  testID?: string;
}

const SIZES = { lg: 48, md: 44, sm: 36 };

function AvatarView(props: AvatarViewProps) {
  const { colors, radius, sizes } = useKitTheme();
  const [failed, setFailed] = useState(false);
  const { testID } = props;
  const name = props.name?.trim() ?? "";
  const initial = name ? Array.from(name)[0].toUpperCase() : "";
  const tone = getToneColors(colors)[name ? getAvatarTone(name) : "neutral"];
  const size = SIZES[props.size ?? "md"];
  const showPhoto = !!props.photoUrl && !failed && !props.pending;
  const styles = StyleSheet.create({
    image: { borderRadius: radius.full, height: size, width: size },
    root: {
      alignItems: "center",
      backgroundColor: props.pending ? colors.surface : tone.background,
      borderColor: colors.border,
      borderRadius: radius.full,
      borderStyle: props.pending ? "dashed" : "solid",
      borderWidth: props.pending ? 1 : 0,
      height: size,
      justifyContent: "center",
      overflow: "hidden",
      width: size,
    },
  });
  let content = (
    <Text.BodyStrong
      color={tone.foreground}
      testID={testID && `${testID}-initial`}
      value={initial}
    />
  );

  if (showPhoto) {
    content = (
      <Image
        accessibilityIgnoresInvertColors
        onError={() => setFailed(true)}
        source={{ uri: props.photoUrl }}
        style={styles.image}
        testID={testID && `${testID}-image`}
      />
    );
  } else if (props.pending || !initial) {
    content = (
      <Icon
        color={tone.foreground}
        name={props.pending ? "email-outline" : "account-outline"}
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

export default AvatarView;
