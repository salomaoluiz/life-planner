import { FlashListProps } from "@shopify/flash-list";
import { cloneElement, ReactElement, ReactNode, useState } from "react";
import {
  LayoutChangeEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useKitTheme } from "@components/utils/useKitTheme";

import { getHorizontalPadding } from "./getHorizontalPadding";

export interface ScreenProps {
  children: ReactNode;
  edges?: ("bottom" | "top")[];
  list?: ReactElement<FlashListProps<never>>;
  maxWidth?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  scroll?: boolean;
  testID?: string;
}

function Screen(props: ScreenProps) {
  const { breakpoint, colors, sizes, spacing } = useKitTheme();
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();
  // The Screen's own width wins over the window width: next to the 240 px navigation rail (plan 009) or inside the
  // Finances layout the available width is smaller than the window, and the 720/960 column must center in THAT width.
  const [measuredWidth, setMeasuredWidth] = useState<number>();
  const width = measuredWidth ?? windowWidth;
  const { testID } = props;
  const edges = props.edges ?? ["top"];
  const horizontal = getHorizontalPadding(
    width,
    breakpoint,
    spacing.lg,
    props.maxWidth ?? sizes.contentMaxWidth,
  );

  const styles = StyleSheet.create({
    content: { gap: spacing.lg },
    root: {
      backgroundColor: colors.background,
      flex: 1,
      paddingBottom: edges.includes("bottom") ? insets.bottom : 0,
      paddingHorizontal: horizontal,
      paddingTop: edges.includes("top") ? insets.top : 0,
    },
  });

  function onLayout(event: LayoutChangeEvent) {
    setMeasuredWidth(event.nativeEvent.layout.width);
  }

  const refreshControl = props.onRefresh ? (
    <RefreshControl
      onRefresh={props.onRefresh}
      refreshing={!!props.refreshing}
    />
  ) : undefined;

  if (props.list) {
    return (
      <View onLayout={onLayout} style={styles.root} testID={testID}>
        {cloneElement(props.list, {
          ListHeaderComponent: (
            <View style={styles.content}>{props.children}</View>
          ),
          onRefresh: props.onRefresh,
          refreshing: !!props.refreshing,
        })}
      </View>
    );
  }

  if (props.scroll) {
    return (
      <View onLayout={onLayout} style={styles.root} testID={testID}>
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          refreshControl={refreshControl}
          showsVerticalScrollIndicator={false}
          testID={testID && `${testID}-scroll`}
        >
          {props.children}
        </ScrollView>
      </View>
    );
  }

  return (
    <View
      onLayout={onLayout}
      style={[styles.root, styles.content]}
      testID={testID}
    >
      {props.children}
    </View>
  );
}

export default Screen;
