import { Text as PaperText } from "react-native-paper";

import { getStyles } from "./styles";
import { TextMode, TextProps } from "./types";

/*
    @fontSize - 16
 */
function Body(props: TextProps) {
  return <TextBase mode={TextMode.Body} {...props} />;
}

/*
    @fontSize - 12
 */
function Caption(props: TextProps) {
  return <TextBase mode={TextMode.Caption} {...props} />;
}

/*
    @fontSize - 48
 */
function Display(props: TextProps) {
  return <TextBase mode={TextMode.Display} {...props} />;
}

/*
    @fontSize - 24
 */
function Headline(props: TextProps) {
  return <TextBase mode={TextMode.Headline} {...props} />;
}

/*
    @fontSize - 14
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
    @fontSize - 20
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
