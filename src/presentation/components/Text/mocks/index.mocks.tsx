import { render } from "@tests";

import { Text, TextProps } from "@components";
import { TextMode } from "@components/Text/types";

const defaultProps = { testID: "default-text", value: "Text Label" };

const components = {
  [TextMode.Body]: Text.Body,
  [TextMode.BodyStrong]: Text.BodyStrong,
  [TextMode.Caption]: Text.Caption,
  [TextMode.Display]: Text.Display,
  [TextMode.Heading]: Text.Heading,
  [TextMode.Overline]: Text.Overline,
  [TextMode.Tab]: Text.Tab,
  [TextMode.Title]: Text.Title,
};

function setup(props?: Partial<TextProps> & { mode?: TextMode }) {
  const Component = components[props?.mode ?? TextMode.Body];
  render(<Component {...defaultProps} {...props} />);
}

export { defaultProps, setup };
