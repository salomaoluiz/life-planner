import { StyleSheet, View } from "react-native";

import Button from "@components/Button";
import Card from "@components/Card";
import IconTile from "@components/IconTile";
import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface StateBlockProps {
  actionLabel?: string;
  actionVariant: "primary" | "secondary";
  icon: string;
  message: string;
  onAction?: () => void;
  testID?: string;
  title?: string;
  tone: "accent" | "expense";
}

const MESSAGE_MAX_WIDTH = 280;

function StateBlock(props: StateBlockProps) {
  const { spacing } = useKitTheme();
  const { testID } = props;
  const styles = StyleSheet.create({
    body: { alignItems: "center", gap: spacing.sm },
    message: { maxWidth: MESSAGE_MAX_WIDTH },
  });
  const ActionButton =
    props.actionVariant === "primary" ? Button.Primary : Button.Secondary;

  return (
    <Card padding="lg" testID={testID} variant="dashed">
      <View style={styles.body}>
        <IconTile
          name={props.icon}
          size="lg"
          testID={testID && `${testID}-tile`}
          tone={props.tone}
        />
        {props.title ? (
          <Text.Heading
            align="center"
            testID={testID && `${testID}-title`}
            value={props.title}
          />
        ) : null}
        <View style={styles.message}>
          <Text.Body
            align="center"
            testID={testID && `${testID}-message`}
            tone="secondary"
            value={props.message}
          />
        </View>
        {props.actionLabel && props.onAction ? (
          <ActionButton
            label={props.actionLabel}
            onPress={props.onAction}
            testID={testID && `${testID}-action`}
          />
        ) : null}
      </View>
    </Card>
  );
}

export default StateBlock;
