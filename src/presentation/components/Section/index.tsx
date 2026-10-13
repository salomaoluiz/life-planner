import { StyleSheet, View } from "react-native";

import Button from "@components/Button";
import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface SectionProps {
  actionLabel?: string;
  children: React.ReactNode;
  onActionPress?: () => void;
  testID?: string;
  title: string;
  variant?: "heading" | "overline";
}

function Section(props: SectionProps) {
  const { spacing } = useKitTheme();
  const { testID } = props;
  const styles = StyleSheet.create({
    body: { gap: spacing.sm },
    header: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    root: { gap: spacing.sm },
    title: { flex: 1 },
  });
  const TitleText = props.variant === "overline" ? Text.Overline : Text.Heading;

  return (
    <View style={styles.root} testID={testID}>
      <View style={styles.header}>
        <View style={styles.title}>
          <TitleText
            numberOfLines={1}
            testID={testID && `${testID}-title`}
            value={props.title}
          />
        </View>
        {props.actionLabel && props.onActionPress ? (
          <Button.Ghost
            label={props.actionLabel}
            onPress={props.onActionPress}
            testID={testID && `${testID}-action`}
          />
        ) : null}
      </View>
      <View style={styles.body}>{props.children}</View>
    </View>
  );
}

export default Section;
