import { StyleSheet, View } from "react-native";

import Button from "@components/Button";
import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface SectionProps {
  /** Keeps the horizontal padding of the action button, so its focus ring does not touch the edge (default: the label lines up with the content edge) */
  actionInset?: boolean;
  actionLabel?: string;
  /** Rendered just before the action button, e.g. a compact select */
  actionLeading?: React.ReactNode;
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
        {props.actionLeading}
        {props.actionLabel && props.onActionPress ? (
          <Button.Ghost
            inline={!props.actionInset}
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
