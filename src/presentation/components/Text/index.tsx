import { Text as RNText } from "react-native";

import { useTextStyle } from "./styles";
import { TextMode, TextProps } from "./types";

function Body(props: TextProps) {
  return <TextBase mode={TextMode.Body} {...props} />;
}

function BodyStrong(props: TextProps) {
  return <TextBase mode={TextMode.BodyStrong} {...props} />;
}
function Caption(props: TextProps) {
  return <TextBase mode={TextMode.Caption} {...props} />;
}
function Display(props: TextProps) {
  return <TextBase mode={TextMode.Display} {...props} />;
}
function Heading(props: TextProps) {
  return <TextBase mode={TextMode.Heading} {...props} />;
}
function Overline(props: TextProps) {
  return <TextBase mode={TextMode.Overline} {...props} />;
}
function Tab(props: TextProps) {
  return <TextBase mode={TextMode.Tab} {...props} />;
}
function TextBase(props: TextProps & { mode: TextMode }) {
  const style = useTextStyle(props.mode, props);

  return (
    <RNText
      accessibilityLiveRegion={props.accessibilityLiveRegion}
      accessibilityRole={props.accessibilityRole}
      numberOfLines={props.numberOfLines}
      style={style}
      testID={props.testID}
    >
      {props.value}
    </RNText>
  );
}
function Title(props: TextProps) {
  return <TextBase mode={TextMode.Title} {...props} />;
}

const Text = {
  Body,
  BodyStrong,
  Caption,
  Display,
  Heading,
  /** Legacy, kept until spec 014: use Text.Heading (removed in spec 014) */
  Headline: Heading,
  /** Legacy, kept until spec 014: use Text.Caption (removed in spec 014) */
  Label: Caption,
  Overline,
  Tab,
  Title,
};

export default Text;
export { TextProps };
