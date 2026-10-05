import Icon from "@components/Icon";
import Touchable from "@components/Touchable";

import useStyles, { RADIUS } from "./styles";

export interface QuickAddButtonProps {
  label: string;
  onPress: () => void;
  testID?: string;
}

function QuickAddButton(props: QuickAddButtonProps) {
  const { styles, theme } = useStyles();

  return (
    <Touchable
      accessibilityLabel={props.label}
      accessibilityRole={"button"}
      focusRadius={RADIUS}
      onPress={props.onPress}
      style={styles.button}
      testID={props.testID ?? "quick-add-button"}
    >
      <Icon
        color={theme.colors.onAccent}
        name={"plus"}
        size={theme.sizes.size.iconLg}
      />
    </Touchable>
  );
}

export default QuickAddButton;
