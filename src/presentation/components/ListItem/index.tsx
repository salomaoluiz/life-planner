import { memo } from "react";
import { StyleSheet, View } from "react-native";

import Divider from "@components/Divider";
import Text from "@components/Text";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface ListItemProps {
  accessibilityLabel?: string;
  divider?: boolean;
  leading?: React.ReactNode;
  onLongPress?: () => void;
  onPress?: () => void;
  selected?: boolean;
  subtitle?: string;
  testID?: string;
  title: string;
  trailing?: React.ReactNode;
}

const MIN_HEIGHT = 56;

function ListItem(props: ListItemProps) {
  const { spacing } = useKitTheme();
  const { testID } = props;
  const styles = StyleSheet.create({
    row: {
      alignItems: "center",
      flexDirection: "row",
      gap: spacing.sm,
      minHeight: MIN_HEIGHT,
      paddingVertical: spacing.sm,
    },
    text: { flex: 1, minWidth: 0 },
  });

  const content = (
    <>
      {props.leading}
      <View style={styles.text}>
        <Text.BodyStrong
          numberOfLines={1}
          testID={testID && `${testID}-title`}
          value={props.title}
        />
        {props.subtitle ? (
          <Text.Caption
            numberOfLines={1}
            testID={testID && `${testID}-subtitle`}
            value={props.subtitle}
          />
        ) : null}
      </View>
      {props.trailing}
    </>
  );

  const interactive = !!props.onPress || !!props.onLongPress;

  return (
    <View>
      {interactive ? (
        <Touchable
          accessibilityLabel={props.accessibilityLabel ?? props.title}
          accessibilityRole="button"
          onLongPress={props.onLongPress}
          onPress={props.onPress}
          selected={props.selected}
          style={styles.row}
          testID={testID}
        >
          {content}
        </Touchable>
      ) : (
        <View style={styles.row} testID={testID}>
          {content}
        </View>
      )}
      {props.divider ? (
        <Divider inset testID={testID && `${testID}-divider`} />
      ) : null}
    </View>
  );
}

export default memo(ListItem);
