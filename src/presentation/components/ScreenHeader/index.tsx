import { StyleSheet, View } from "react-native";

import Icon from "@components/Icon";
import Text from "@components/Text";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface ScreenHeaderProps {
  actions?: React.ReactNode;
  /** Makes the title block a button with a chevron (section pickers) */
  onTitlePress?: () => void;
  overline?: string;
  subtitle?: string;
  testID?: string;
  title: string;
  titleAccessibilityLabel?: string;
}

function ScreenHeader(props: ScreenHeaderProps) {
  const { colors, spacing } = useKitTheme();
  const { testID } = props;
  const styles = StyleSheet.create({
    actions: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
    root: { alignItems: "center", flexDirection: "row", gap: spacing.sm },
    text: { gap: spacing.xxs },
    textArea: { flex: 1 },
    titleButton: { alignSelf: "flex-start", justifyContent: "center" },
    titleRow: { alignItems: "center", flexDirection: "row", gap: spacing.xs },
  });

  function renderTitle() {
    const title = (
      <Text.Title
        accessibilityRole="header"
        testID={testID && `${testID}-title`}
        value={props.title}
      />
    );

    if (!props.onTitlePress) {
      return title;
    }

    return (
      <View style={styles.titleRow}>
        {title}
        <Icon color={colors.textPrimary} name="chevron-down" size={20} />
      </View>
    );
  }

  function renderText() {
    const text = (
      <View style={styles.text}>
        {props.overline ? (
          <Text.Overline
            testID={testID && `${testID}-overline`}
            tone="secondary"
            value={props.overline}
          />
        ) : null}
        {renderTitle()}
        {props.subtitle ? (
          <Text.Caption
            testID={testID && `${testID}-subtitle`}
            value={props.subtitle}
          />
        ) : null}
      </View>
    );

    if (!props.onTitlePress) {
      return text;
    }

    return (
      <Touchable
        accessibilityLabel={props.titleAccessibilityLabel ?? props.title}
        accessibilityRole="button"
        minTouchTarget
        onPress={props.onTitlePress}
        style={styles.titleButton}
        testID={testID && `${testID}-title-button`}
      >
        {text}
      </Touchable>
    );
  }

  return (
    <View style={styles.root} testID={testID}>
      <View style={styles.textArea}>{renderText()}</View>
      {props.actions ? (
        <View style={styles.actions}>{props.actions}</View>
      ) : null}
    </View>
  );
}

export default ScreenHeader;
