import Text from "@components/Text";
import { TextProps } from "@components/Text/types";
import Tooltip from "@components/Tooltip";

export interface TruncatedTextProps {
  testID?: string;
  tone?: TextProps["tone"];
  /** Test id of the tooltip bubble (web) */
  tooltipTestID?: string;
  value: string;
  variant?: "body" | "caption" | "strong";
}

const MAX_LINES = 2;
const variants = {
  body: (shared: TextProps) => <Text.Body {...shared} />,
  caption: (shared: TextProps) => <Text.Caption {...shared} />,
  strong: (shared: TextProps) => <Text.BodyStrong {...shared} />,
};

// Spec 048 FR 27: text wraps up to 2 lines and only then ends in "…"; the whole text is in a tooltip (web hover).
function TruncatedText(props: TruncatedTextProps) {
  const shared = {
    numberOfLines: MAX_LINES,
    testID: props.testID,
    tone: props.tone,
    value: props.value,
  };

  return (
    <Tooltip
      content={<Text.Caption value={props.value} />}
      testID={props.tooltipTestID}
    >
      {variants[props.variant ?? "body"](shared)}
    </Tooltip>
  );
}

export default TruncatedText;
