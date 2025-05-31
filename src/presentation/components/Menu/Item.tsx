import { Menu as PaperMenu } from "react-native-paper";

interface Props {
  onPress: () => void;
  title: string;
}

function MenuItem(props: Props) {
  const { onPress, title } = props;

  return <PaperMenu.Item onPress={onPress} title={title}  />;
}

export default MenuItem;
