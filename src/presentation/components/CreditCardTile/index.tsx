import { StyleSheet, View } from "react-native";

import Text from "@components/Text";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

import withAlpha from "./withAlpha";

export interface CreditCardTileProps {
  accessibilityLabel: string;
  available: React.ReactNode;
  availableLabel: string;
  brandLabel: string;
  lastDigits?: string;
  onPress: () => void;
  selected?: boolean;
  testID?: string;
  /** Stored card color (#RRGGBB): the tile background is a soft tint of it */
  tint: string;
  title: string;
}

const MIN_WIDTH = 220;
const TINT_ALPHA = 0.16;

function CreditCardTile(props: CreditCardTileProps) {
  const { colors, radius, spacing } = useKitTheme();
  const { testID } = props;
  const styles = StyleSheet.create({
    header: {
      alignItems: "center",
      flexDirection: "row",
      justifyContent: "space-between",
    },
    root: {
      backgroundColor: withAlpha(props.tint, TINT_ALPHA),
      borderColor: props.selected ? props.tint : colors.border,
      borderRadius: radius.lg,
      borderWidth: props.selected ? 2 : 1,
      gap: spacing.xs,
      minWidth: MIN_WIDTH,
      padding: spacing.md,
    },
  });

  return (
    <Touchable
      accessibilityLabel={props.accessibilityLabel}
      accessibilityRole="button"
      focusRadius={radius.lg}
      minTouchTarget={false}
      onPress={props.onPress}
      selected={props.selected}
      style={styles.root}
      testID={testID}
    >
      <View style={styles.header}>
        <Text.Overline
          testID={testID && `${testID}-brand`}
          tone="secondary"
          value={props.brandLabel}
        />
        {props.lastDigits ? (
          <Text.Caption
            testID={testID && `${testID}-digits`}
            value={`•••• ${props.lastDigits}`}
          />
        ) : null}
      </View>
      <Text.BodyStrong
        numberOfLines={1}
        testID={testID && `${testID}-title`}
        value={props.title}
      />
      <View>
        <Text.Caption tone="secondary" value={props.availableLabel} />
        {props.available}
      </View>
    </Touchable>
  );
}

export default CreditCardTile;
