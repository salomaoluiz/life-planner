import { useEffect, useRef } from "react";
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

import useStyles from "./styles";

export interface BottomSheetProps {
  children: React.ReactNode;
  closeLabel: string;
  footer?: React.ReactNode;
  onClose: () => void;
  presentation?: "inline" | "modal";
  subtitle?: string;
  testID?: string;
  title: string;
  visible: boolean;
}

const SLIDE_MS = 250;
const SLIDE_OFFSET = 600;
const SWIPE_CLOSE_DISTANCE = 80;

function BottomSheet(props: BottomSheetProps) {
  const { breakpoint } = useKitTheme();
  const wide = breakpoint !== "compact";
  const styles = useStyles(wide);
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

  const content = (
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
        <View style={styles.header}>
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
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          testID={testID && `${testID}-body`}
        >
          {props.children}
        </ScrollView>
        {props.footer ? (
          <View style={styles.footer} testID={testID && `${testID}-footer`}>
            {props.footer}
          </View>
        ) : null}
      </Animated.View>
    </KeyboardAvoidingView>
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
