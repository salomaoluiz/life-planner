import Icon from "@components/Icon";
import Text from "@components/Text";
import Touchable from "@components/Touchable";

import useStyles, { FAB_RADIUS } from "./styles";

export interface FabProps {
  /** Shows the label next to the icon; otherwise the label is only the accessibility label */
  extended?: boolean;
  label: string;
  onPress: () => void;
  testID?: string;
}

// Floating action button (spec 050): icon-only on compact, extended (icon + label) on wide.
function Fab(props: FabProps) {
  const { styles, theme } = useStyles(!!props.extended);

  return (
    <Touchable
      accessibilityLabel={props.label}
      accessibilityRole={"button"}
      focusRadius={FAB_RADIUS}
      focusRingColor={theme.colors.onAccent}
      onPress={props.onPress}
      style={styles.button}
      testID={props.testID ?? "fab"}
    >
      <Icon
        color={theme.colors.onAccent}
        name={"plus"}
        size={theme.sizes.size.iconLg}
      />
      {props.extended ? (
        <Text.BodyStrong color={theme.colors.onAccent} value={props.label} />
      ) : null}
    </Touchable>
  );
}

export default Fab;
