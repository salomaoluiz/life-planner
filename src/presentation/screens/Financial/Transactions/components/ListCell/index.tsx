import { View, ViewProps } from "react-native";

const BASE_Z = 100000;

interface Props extends ViewProps {
  index: number;
}

// The list cells are absolutely positioned, so a later cell paints over the tooltip bubble of the row above it
// (spec 059): earlier cells get a higher zIndex and the bubble can overflow into the next rows.
function ListCell({ index, style, ...rest }: Props) {
  return <View {...rest} style={[style, { zIndex: BASE_Z - index }]} />;
}

export default ListCell;
