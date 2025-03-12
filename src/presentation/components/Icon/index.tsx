import { Icon as PaperIcon } from "react-native-paper";

export interface IconProps {
  color?: string;
  name: string;
  size: number;
  testID: string;
}

function Icon({ color, name, size, testID }: IconProps) {
  return <PaperIcon color={color} size={size} source={name} testID={testID} />;
}

export default Icon;
