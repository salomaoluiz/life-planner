import { View } from "react-native";

import { useKitTheme } from "@components/utils/useKitTheme";

import BoxSkeleton from "./Box";

function CardSkeleton(props: { testID?: string }) {
  const { radius } = useKitTheme();

  return (
    <View testID={props.testID}>
      <BoxSkeleton borderRadius={radius.lg} height={96} width="100%" />
    </View>
  );
}

export default CardSkeleton;
