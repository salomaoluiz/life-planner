import { BlurView } from "expo-blur";
import { useState } from "react";
import { Pressable, View } from "react-native";
import * as Paper from "react-native-paper-dates";

import { IconButton } from "@components/Icon";
import Text from "@components/Text";
import { useTranslation, useTranslationLocale } from "@presentation/i18n";

import getStyles from "./styles";

export interface DatePickerProps {
  date?: Date;
  label: string;
  mode: "single";
  onConfirm: (params: { date?: Date }) => void;
  onDismiss?: () => void;
  testID?: string;
}

function DatePicker(props: DatePickerProps) {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);
  const { getLocale } = useTranslationLocale();
  const { styles, theme } = getStyles();

  function onConfirm({ date }: { date?: Date }) {
    props.onConfirm({ date });
    setVisible(false);
  }

  function onDismiss() {
    setVisible(false);
    props.onDismiss?.();
  }

  function onPress() {
    setVisible(true);
  }

  function clearDate() {
    props.onConfirm({ date: undefined });
  }

  return (
    <View style={styles.mainWrapper}>
      <Text.Body color={theme.colors.textPrimary} value={props.label} />
      <Pressable
        accessible={true}
        onPress={onPress}
        style={styles.pressable}
        testID={props.testID}
      >
        <BlurView
          intensity={theme.dark ? 20 : 40}
          style={styles.container}
          tint={theme.dark ? "dark" : "light"}
        >
          <View style={styles.innerContainer}>
            <Text.Body
              color={
                props.date
                  ? theme.colors.textPrimary
                  : theme.colors.textSecondary
              }
              testID={
                props.testID ? `${props.testID}-value` : "date-picker-value"
              }
              value={
                props.date ? props.date.toLocaleDateString() : "Select a date"
              }
            />

            <Paper.DatePickerModal
              date={props.date}
              label={props.label}
              locale={getLocale().languageTag}
              mode={props.mode}
              onConfirm={onConfirm}
              onDismiss={onDismiss}
              saveLabel={"Save"}
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-expect-error
              testID={`${props.testID}-modal`}
              visible={visible}
            />
          </View>
          {props.date ? (
            <View style={styles.clearIconContainer}>
              <IconButton
                accessibilityLabel={t("common.actions.clear")}
                name={"close"}
                onPress={clearDate}
                size={theme.sizes.spacing.xl}
                testID={
                  props.testID ? `${props.testID}-clear-button` : "clear-button"
                }
              />
            </View>
          ) : null}
        </BlurView>
      </Pressable>
    </View>
  );
}

export default DatePicker;
