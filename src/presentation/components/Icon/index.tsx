import {
  Icon as PaperIcon,
  IconButton as PaperIconButton,
} from "react-native-paper";

export interface IconProps {
  color?: string;
  name: string;
  size: number;
  testID?: string;
}

interface IconButtonProps extends IconProps {
  onPress: () => void;
}

function Icon({ color, name, size, testID }: IconProps) {
  return <PaperIcon color={color} size={size} source={name} testID={testID} />;
}

function IconButton(props: IconButtonProps) {
  return (
    <PaperIconButton
      icon={props.name}
      iconColor={props.color}
      onPress={props.onPress}
      size={props.size}
      testID={props.testID}
    />
  );
}

export default Icon;
export { IconButton };
