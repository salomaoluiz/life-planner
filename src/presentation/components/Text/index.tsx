import { Text as PaperText } from "react-native-paper";
import { getStyles } from "./styles";
import { TextMode } from "./types";
import getCustomStyles, { CustomStyles } from "./styles/customStyles";

export interface TextProps {
  value: string;
  testID: string;
  customStyles?: CustomStyles;
}

function TextBase(props: TextProps & { mode: TextMode }) {
  const { testID, value, mode, customStyles } = props;

  const styles = getStyles();
  const extraStyles = getCustomStyles(customStyles);
  return (
    <PaperText
      variant={mode}
      testID={testID}
      style={[styles[mode], extraStyles]}
    >
      {value}
    </PaperText>
  );
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
    @fontSize - 20
 */
function Title(props: TextProps) {
  return <TextBase mode={TextMode.Title} {...props} />;
}

/*
    @fontSize - 16
 */
function Body(props: TextProps) {
  return <TextBase mode={TextMode.Body} {...props} />;
}

/*
    @fontSize - 14
 */
function Label(props: TextProps) {
  return <TextBase mode={TextMode.Label} {...props} />;
}

/*
    @fontSize - 12
 */
function Caption(props: TextProps) {
  return <TextBase mode={TextMode.Caption} {...props} />;
}

const Text = {
  Display,
  Headline,
  Title,
  Body,
  Label,
  Caption,
};

export default Text;
