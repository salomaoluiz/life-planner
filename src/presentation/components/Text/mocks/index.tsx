import { Text, TextProps } from "@components";
import { TextMode } from "@components/Text/types";
import * as theme from "@presentation/theme";
import { lightTheme } from "@presentation/theme/provider";
import { render } from "@tests";

jest.mock("@presentation/theme");

jest
  .spyOn(theme, "useTheme")
  .mockReturnValue({ isDark: false, setIsDark: jest.fn(), theme: lightTheme });

const defaultProps: TextProps = {
  testID: "default-text",
  value: "Text Label",
};

function renderComponent(props?: Partial<TextProps & { mode: TextMode }>) {
  switch (props?.mode) {
    case TextMode.Body:
      return <Text.Body {...defaultProps} {...props} />;
    case TextMode.Caption:
      return <Text.Caption {...defaultProps} {...props} />;
    case TextMode.Display:
      return <Text.Display {...defaultProps} {...props} />;
    case TextMode.Headline:
      return <Text.Headline {...defaultProps} {...props} />;
    case TextMode.Label:
      return <Text.Label {...defaultProps} {...props} />;
    case TextMode.Title:
      return <Text.Title {...defaultProps} {...props} />;

    default:
      throw new Error("Invalid mode");
  }
}

function setup(props?: Partial<TextProps & { mode: TextMode }>) {
  return render(renderComponent({ mode: TextMode.Body, ...props }));
}

export { defaultProps, setup };
