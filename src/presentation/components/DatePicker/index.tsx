import { useState } from "react";
import { Pressable, View } from "react-native";
import * as Paper from "react-native-paper-dates";

import { IconButton } from "@components/Icon";
import Text from "@components/Text";
import { useTranslationLocale } from "@presentation/i18n";

import getStyles from "./styles";

interface DatePickerProps {
  date?: Date;
  label: string;
  mode: "single";
  onConfirm: (params: { date?: Date }) => void;
  onDismiss?: () => void;
}

function DatePicker(props: DatePickerProps) {
  const [visible, setVisible] = useState(false);
  const { getLocale } = useTranslationLocale();
  const { styles, theme } = getStyles({ hasDate: !!props.date });

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
    <Pressable onPress={onPress} style={styles.pressable}>
      <View style={styles.container}>
        <View>
          <View style={styles.labelContainer}>
            <Text.Body value={props.label} />
          </View>
          {props.date ? (
            <View style={styles.dateContainer}>
              <Text.Body value={props.date?.toLocaleDateString()} />
            </View>
          ) : null}

          <Paper.DatePickerModal
            date={props.date}
            label={props.label}
            locale={getLocale().languageTag}
            mode={props.mode}
            onConfirm={onConfirm}
            onDismiss={onDismiss}
            saveLabel={"Save"}
            visible={visible}
          />
        </View>
        {props.date ? (
          <View style={styles.clearIconContainer}>
            <IconButton
              name={"close"}
              onPress={clearDate}
              size={theme.sizes.spacing.large}
            />
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

export default DatePicker;
