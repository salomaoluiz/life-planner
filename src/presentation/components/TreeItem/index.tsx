import { ReactNode } from "react";
import { StyleSheet, useWindowDimensions, View } from "react-native";

import ListItem from "@components/ListItem";
import { useKitTheme } from "@components/utils/useKitTheme";

export interface TreeItemProps {
  depth: number;
  divider?: boolean;
  leading?: ReactNode;
  onPress?: () => void;
  subtitle?: string;
  testID?: string;
  title: string;
  trailing?: ReactNode;
}

const INDENT = 24;
const NARROW_INDENT = 16;
const NARROW_WIDTH = 360;

// 24 dp per level; 16 dp on narrow phones (down to 320 px).
function getIndentPerLevel(width: number) {
  return width < NARROW_WIDTH ? NARROW_INDENT : INDENT;
}

function TreeItem(props: TreeItemProps) {
  const { width } = useWindowDimensions();
  const { colors } = useKitTheme();
  const styles = StyleSheet.create({
    container: {
      borderLeftColor: colors.border,
      borderLeftWidth: props.depth > 0 ? 1 : 0,
      // The 1 px guide line is part of the indent, so the content starts exactly 24 dp per level in.
      marginLeft:
        getIndentPerLevel(width) * props.depth - (props.depth > 0 ? 1 : 0),
    },
  });

  return (
    <View style={styles.container} testID={`${props.testID}-container`}>
      <ListItem
        divider={props.divider}
        leading={props.leading}
        onPress={props.onPress}
        subtitle={props.subtitle}
        testID={props.testID}
        title={props.title}
        trailing={props.trailing}
      />
    </View>
  );
}

export { getIndentPerLevel };
export default TreeItem;
