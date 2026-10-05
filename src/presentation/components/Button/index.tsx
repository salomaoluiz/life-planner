import { ActivityIndicator } from "react-native";

import Icon from "@components/Icon";
import Text from "@components/Text";
import Touchable from "@components/Touchable";
import { useKitTheme } from "@components/utils/useKitTheme";

import useStyles, { ButtonVariant } from "./styles";

export interface ButtonProps {
  accessibilityLabel?: string;
  /** Legacy, kept until spec 014: ignored, use Button.Destructive / Button.Secondary */
  customStyles?: { backgroundColor?: string; textColor?: string };
  disabled?: boolean;
  fullWidth?: boolean;
  icon?: string;
  label: string;
  loading?: boolean;
  onPress: () => void;
  size?: "lg" | "md";
  testID?: string;
  /** Ghost only ("Delete ..." in edit forms); ignored by the other variants */
  tone?: "expense";
}

function ButtonBase(props: ButtonProps & { variant: ButtonVariant }) {
  const { radius, sizes } = useKitTheme();
  const { iconColor, labelColor, styles } = useStyles(
    props.variant,
    props.size ?? "md",
    !!props.fullWidth,
    props.tone,
  );
  const { testID } = props;

  let leading = null;
  if (props.loading) {
    leading = (
      <ActivityIndicator
        color={iconColor}
        size="small"
        testID={testID && `${testID}-spinner`}
      />
    );
  } else if (props.icon) {
    leading = (
      <Icon
        color={iconColor}
        name={props.icon}
        size={sizes.iconMd}
        testID={testID && `${testID}-icon`}
      />
    );
  }

  return (
    <Touchable
      accessibilityLabel={props.accessibilityLabel ?? props.label}
      accessibilityRole="button"
      busy={props.loading}
      disabled={props.disabled}
      focusRadius={radius.md}
      onPress={props.onPress}
      style={styles.root}
      testID={testID}
    >
      {leading}
      <Text.BodyStrong
        color={labelColor}
        testID={testID && `${testID}-label`}
        value={props.label}
      />
    </Touchable>
  );
}

function Destructive(props: ButtonProps) {
  return <ButtonBase {...props} variant="destructive" />;
}
function Ghost(props: ButtonProps) {
  return <ButtonBase {...props} variant="ghost" />;
}
function Primary(props: ButtonProps) {
  return <ButtonBase {...props} variant="primary" />;
}
function Secondary(props: ButtonProps) {
  return <ButtonBase {...props} variant="secondary" />;
}

/**
 * One Primary per screen or sheet. Cancel is never red (use Secondary or the
 * sheet's close button). Destructive only for delete/leave/remove.
 */
const Button = {
  Destructive,
  /** Legacy, kept until spec 014: use Button.Primary */
  Filled: Primary,
  Ghost,
  /** Legacy, kept until spec 014: use Button.Secondary */
  Outlined: Secondary,
  Primary,
  Secondary,
  /** Legacy, kept until spec 014: use Button.Ghost */
  Text: Ghost,
};

export default Button;
