import { Text as PaperText } from "react-native-paper";
import { getStyles } from "./styles";
import { TextMode } from "./types";

export interface TextProps {
  value: string;
  testID: string;
}

function TextBase(props: TextProps & { mode: TextMode }) {
  const { testID, value, mode } = props;

  const styles = getStyles();

  return (
    <PaperText variant={mode} testID={testID} style={styles[mode]}>
      {value}
    </PaperText>
  );
}

function Display(props: TextProps) {
  return <TextBase mode={TextMode.Display} {...props} />;
}

function Headline(props: TextProps) {
  return <TextBase mode={TextMode.Headline} {...props} />;
}

function Title(props: TextProps) {
  return <TextBase mode={TextMode.Title} {...props} />;
}

function Body(props: TextProps) {
  return <TextBase mode={TextMode.Body} {...props} />;
}

function Label(props: TextProps) {
  return <TextBase mode={TextMode.Label} {...props} />;
}

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
