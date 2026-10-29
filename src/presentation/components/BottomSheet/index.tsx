import { useEffect, useMemo, useRef } from "react";
import {
  AccessibilityInfo,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { IconButton } from "@components/Icon";
import Text from "@components/Text";
import { useKitTheme } from "@components/utils/useKitTheme";
import useWindowSize from "@components/utils/useWindowSize";
import { isWeb } from "@utils/platform";

import { fluidSheetSize } from "./fluidSize";
import { SheetLayoutProvider } from "./SheetLayoutContext";
import useStyles from "./styles";

export interface BottomSheetProps {
  children: React.ReactNode;
  closeLabel: string;
  footer?: React.ReactNode;
  /** Second action next to the footer: below it on compact, before it (to its left) on a wide form */
  footerSecondary?: React.ReactNode;
  footerStart?: React.ReactNode;
  onClose: () => void;
  /** Wide `form` only: the sheet has a fixed height and each column of `FormColumns` scrolls on its own (spec 051) */
  paneScroll?: boolean;
  presentation?: "inline" | "modal";
  /** `wizard` is a `form` that is wider on expanded screens (the import wizard, spec 047); `fluid` grows with the
   *  window and its children scroll on their own (spec 048) */
  size?: "dialog" | "fluid" | "form" | "wizard";
  subtitle?: string;
  testID?: string;
  title: string;
  visible: boolean;
}

// Visible sheets on web, oldest first; Esc closes the last one only.
const openSheets: symbol[] = [];
const PANE_HEIGHT_RATIO = 0.9;
const PANE_MAX_HEIGHT = 720;
const SLIDE_MS = 250;
const SLIDE_OFFSET = 600;
const SWIPE_CLOSE_DISTANCE = 80;

function BottomSheet(props: BottomSheetProps) {
  const { breakpoint } = useKitTheme();
  const wide = breakpoint !== "compact";
  const window = useWindowSize();
  const isForm =
    props.size === "form" || props.size === "wizard" || props.size === "fluid";
  const wideForm = wide && isForm;
  const fluid =
    wideForm && props.size === "fluid" ? fluidSheetSize(window) : undefined;
  const panes = wideForm && !fluid && !!props.paneScroll;
  const styles = useStyles(
    wide,
    isForm,
    breakpoint === "medium",
    props.size === "wizard" || props.size === "fluid",
    fluid,
    panes
      ? Math.min(window.height * PANE_HEIGHT_RATIO, PANE_MAX_HEIGHT)
      : undefined,
  );
  const layout = useMemo(
    () => ({
      columns: wideForm ? (2 as const) : (1 as const),
      fluid: !!fluid || panes,
    }),
    [wideForm, fluid, panes],
  );
  const offset = useSharedValue(wide ? 0 : SLIDE_OFFSET);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: offset.value }],
  }));
  const onCloseRef = useRef(props.onClose);
  onCloseRef.current = props.onClose;
  const { testID } = props;

  useEffect(() => {
    if (!props.visible || wide) {
      return;
    }
    offset.value = SLIDE_OFFSET;
    AccessibilityInfo.isReduceMotionEnabled().then((reduce) => {
      offset.value = withTiming(0, { duration: reduce ? 0 : SLIDE_MS });
    });
  }, [props.visible, wide, offset]);

  useEffect(() => {
    if (!props.visible || !isWeb() || typeof document === "undefined") {
      return;
    }
    const token = Symbol("sheet");
    openSheets.push(token);
    function onKeyDown(event: KeyboardEvent) {
      // Only the top-most sheet reacts, so Esc on a nested picker leaves the form open.
      if (
        event.key === "Escape" &&
        openSheets[openSheets.length - 1] === token
      ) {
        onCloseRef.current();
      }
    }
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      openSheets.splice(openSheets.indexOf(token), 1);
    };
  }, [props.visible]);

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderRelease: (_event, gesture) => {
        if (gesture.dy > SWIPE_CLOSE_DISTANCE) {
          onCloseRef.current();
        }
      },
      onStartShouldSetPanResponder: () => true,
    }),
  ).current;

  if (!props.visible) {
    return null;
  }

  function renderFooter() {
    if (!wideForm || !(props.footer || props.footerStart)) {
      return props.footer ? (
        <View style={styles.footer} testID={testID && `${testID}-footer`}>
          {props.footer}
          {props.footerSecondary}
        </View>
      ) : null;
    }

    return (
      <View
        style={[
          styles.footer,
          { justifyContent: props.footerStart ? "space-between" : "flex-end" },
        ]}
        testID={testID && `${testID}-footer`}
      >
        {props.footerStart}
        <View style={styles.footerEnd}>
          {props.footerSecondary && (
            <View style={styles.footerAction}>{props.footerSecondary}</View>
          )}
          <View style={styles.footerAction}>{props.footer}</View>
        </View>
      </View>
    );
  }

  const content = (
    <SheetLayoutProvider value={layout}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.overlay}
      >
        <Pressable
          accessibilityLabel={props.closeLabel}
          accessibilityRole="button"
          onPress={props.onClose}
          style={styles.backdrop}
          testID={testID && `${testID}-backdrop`}
        />
        <Animated.View style={[styles.sheet, animatedStyle]} testID={testID}>
          {wide ? null : (
            <View
              {...pan.panHandlers}
              accessibilityElementsHidden
              importantForAccessibility="no-hide-descendants"
              style={styles.grabberArea}
              testID={testID && `${testID}-grabber`}
            >
              <View style={styles.grabber} />
            </View>
          )}
          <View style={wideForm ? styles.headerForm : styles.header}>
            <View style={styles.title}>
              <Text.Heading
                accessibilityRole="header"
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
            <IconButton
              accessibilityLabel={props.closeLabel}
              name="close"
              onPress={props.onClose}
              testID={testID && `${testID}-close`}
              variant="plain"
            />
          </View>
          {fluid || panes ? (
            <View style={styles.fluidBody} testID={testID && `${testID}-body`}>
              {props.children}
            </View>
          ) : (
            <ScrollView
              contentContainerStyle={styles.body}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
              style={styles.scroll}
              testID={testID && `${testID}-body`}
            >
              {props.children}
              {wideForm ? null : props.footerStart}
            </ScrollView>
          )}
          {renderFooter()}
        </Animated.View>
      </KeyboardAvoidingView>
    </SheetLayoutProvider>
  );

  if (props.presentation === "inline") {
    return <View style={styles.backdrop}>{content}</View>;
  }

  return (
    <Modal
      animationType="none"
      onRequestClose={props.onClose}
      transparent
      visible
    >
      {content}
    </Modal>
  );
}

export default BottomSheet;
