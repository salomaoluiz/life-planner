import { Text as PaperText } from "react-native-paper";

import { getStyles } from "./styles";
import { TextMode, TextProps } from "./types";

/*
    @fontSize - 15
 */
function Body(props: TextProps) {
  return <TextBase mode={TextMode.Body} {...props} />;
}

/*
    @fontSize - 13
 */
function Caption(props: TextProps) {
  return <TextBase mode={TextMode.Caption} {...props} />;
}

/*
    @fontSize - 34
 */
function Display(props: TextProps) {
  return <TextBase mode={TextMode.Display} {...props} />;
}

/*
    @fontSize - 22
 */
function Headline(props: TextProps) {
  return <TextBase mode={TextMode.Headline} {...props} />;
}

/*
    @fontSize - 13
 */
function Label(props: TextProps) {
  return <TextBase mode={TextMode.Label} {...props} />;
}

function TextBase(props: TextProps & { mode: TextMode }) {
  const { mode, testID, value } = props;

  const styles = getStyles(props);
  return (
    <PaperText
      numberOfLines={props.numberOfLines}
      style={styles[mode]}
      testID={testID}
      variant={mode}
    >
      {value}
    </PaperText>
  );
}

/*
    @fontSize - 16
 */
function Title(props: TextProps) {
  return <TextBase mode={TextMode.Title} {...props} />;
}

const Text = {
  Body,
  Caption,
  Display,
  Headline,
  Label,
  Title,
};

export default Text;
export { TextProps };
