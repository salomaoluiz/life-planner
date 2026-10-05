import { StyleSheet, View } from "react-native";

import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface ScreenHeaderProps {
  actions?: React.ReactNode;
  overline?: string;
  subtitle?: string;
  testID?: string;
  title: string;
}

function ScreenHeader(props: ScreenHeaderProps) {
  const { spacing } = useKitTheme();
  const { testID } = props;
  const styles = StyleSheet.create({
    actions: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
    root: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
    text: { flex: 1, gap: spacing.xxs },
  });

  return (
    <View style={styles.root} testID={testID}>
      <View style={styles.text}>
        {props.overline ? (
          <Text.Overline
            testID={testID && `${testID}-overline`}
            tone="secondary"
            value={props.overline}
          />
        ) : null}
        <Text.Title
          accessibilityRole="header"
          testID={testID && `${testID}-title`}
          value={props.title}
        />
        {props.subtitle ? (
          <Text.Caption
            testID={testID && `${testID}-subtitle`}
            value={props.subtitle}
          />
        ) : null}
      </View>
      {props.actions ? (
        <View style={styles.actions}>{props.actions}</View>
      ) : null}
    </View>
  );
}

export default ScreenHeader;
