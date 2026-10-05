import { useState } from "react";
import { TextInput, View } from "react-native";

import FocusRing from "@components/FocusRing";
import Icon, { IconButton } from "@components/Icon";
import useStyles, { getFrameStyle } from "@components/TextField/styles";

export interface SearchFieldProps {
  autoFocus?: boolean;
  clearLabel: string;
  onChangeText: (text: string) => void;
  onSubmitEditing?: () => void;
  placeholder: string;
  testID?: string;
  value: string;
}

function SearchField(props: SearchFieldProps) {
  const [focused, setFocused] = useState(false);
  const { styles, theme } = useStyles(false);
  const { testID } = props;

  return (
    <View style={getFrameStyle({ focused, theme })}>
      <View style={styles.icon}>
        <Icon
          color={theme.colors.textSecondary}
          name="magnify"
          size={theme.sizes.iconMd}
        />
      </View>
      <TextInput
        accessibilityLabel={props.placeholder}
        autoFocus={props.autoFocus}
        onBlur={() => setFocused(false)}
        onChangeText={props.onChangeText}
        onFocus={() => setFocused(true)}
        onSubmitEditing={props.onSubmitEditing}
        placeholder={props.placeholder}
        placeholderTextColor={theme.colors.textSecondary}
        returnKeyType="search"
        style={styles.input}
        testID={testID}
        value={props.value}
      />
      {props.value ? (
        <IconButton
          accessibilityLabel={props.clearLabel}
          name="close-circle"
          onPress={() => props.onChangeText("")}
          testID={testID && `${testID}-clear`}
          variant="plain"
        />
      ) : null}
      <FocusRing radius={theme.radius.md} visible={focused} />
    </View>
  );
}

export default SearchField;
