import { useState } from "react";
import { View } from "react-native";
import { Avatar } from "react-native-paper";

import Skeleton from "@components/Skeleton";

interface AvatarDTOProps {
  size: number;
  source: string;
}

function AvatarIcon(props: AvatarDTOProps) {
  return (
    <Avatar.Icon icon={props.source} size={props.size} testID="avatar-icon" />
  );
}

function AvatarImage(props: AvatarDTOProps) {
  const [loading, setLoading] = useState(true);
  return (
    <View>
      {loading && <Skeleton.Circle size={props.size} />}
      <Avatar.Image
        onLoad={() => setLoading(false)}
        size={props.size}
        source={{ uri: props.source }}
        testID="avatar-image"
      />
    </View>
  );
}

function AvatarText(props: AvatarDTOProps) {
  function getLabel() {
    return props.source
      .split(" ")
      .map((word) => word[0].toUpperCase())
      .join("");
  }

  return (
    <Avatar.Text label={getLabel()} size={props.size} testID="avatar-text" />
  );
}

export { AvatarIcon, AvatarImage, AvatarText };
