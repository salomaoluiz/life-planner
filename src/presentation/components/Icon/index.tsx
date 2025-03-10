import { Icon as PaperIcon } from "react-native-paper";

export interface IconProps {
  testID: string;
  name: string;
  size: number;
  color?: string;
}

function Icon({ testID, name, size, color }: IconProps) {
  return <PaperIcon testID={testID} color={color} source={name} size={size} />;
}

export default Icon;
