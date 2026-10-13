import { StyleSheet, View, ViewStyle } from "react-native";

import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface CardProps {
  accessibilityLabel?: string;
  children: React.ReactNode;
  /** Legacy, kept until spec 014: compose with Section/ListItem instead */
  customStyles?: ViewStyle;
  onPress?: () => void;
  padding?: "lg" | "md" | "sm";
  testID?: string;
  variant?: "dashed" | "default";
}

function Card(props: CardProps) {
  const { colors, radius, spacing } = useKitTheme();
  const styles = StyleSheet.create({
    root: {
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: radius.lg,
      borderStyle: props.variant === "dashed" ? "dashed" : "solid",
      borderWidth: 1,
      padding: spacing[props.padding ?? "md"],
    },
  });

  if (props.onPress) {
    return (
      <Touchable
        accessibilityLabel={props.accessibilityLabel}
        accessibilityRole="button"
        focusRadius={radius.lg}
        onPress={props.onPress}
        style={[styles.root, props.customStyles]}
        testID={props.testID}
      >
        {props.children}
      </Touchable>
    );
  }

  return (
    <View style={[styles.root, props.customStyles]} testID={props.testID}>
      {props.children}
    </View>
  );
}

export default Card;
