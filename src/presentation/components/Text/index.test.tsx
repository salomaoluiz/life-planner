import { screen } from "@tests";

import { TextMode } from "@components/Text/types";
import { TypographyToken } from "@presentation/theme/constants";
import { lightTheme } from "@presentation/theme/provider";

import { defaultProps, setup } from "./mocks/index.mocks";

it("SHOULD render the Text with the correct props", () => {
  setup();

  const component = screen.getByTestId(defaultProps.testID);

  expect(component.props).toEqual({
    children: "Text Label",
    style: expect.any(Object),
    testID: "default-text",
    variant: TextMode.Body,
  });
});

it.each([
  TextMode.Display,
  TextMode.Headline,
  TextMode.Title,
  TextMode.Body,
  TextMode.Label,
  TextMode.Caption,
])("SHOULD render the Text in %s variant", (mode) => {
  setup({ mode });

  const component = screen.getByTestId(defaultProps.testID);

  expect(component.props.variant).toBe(mode);
});

it.each<{ modeString: keyof typeof TextMode; token: TypographyToken }>([
  { modeString: "Display", token: "display" },
  { modeString: "Headline", token: "title" },
  { modeString: "Title", token: "heading" },
  { modeString: "Body", token: "body" },
  { modeString: "Label", token: "caption" },
  { modeString: "Caption", token: "caption" },
])(
  "SHOULD render the Text.$modeString with the $token style",
  ({ modeString, token }) => {
    setup({ mode: TextMode[modeString] });

    expect(screen.getByTestId(defaultProps.testID).props.style).toEqual(
      expect.objectContaining({
        fontSize: lightTheme.typography[token].fontSize,
        lineHeight: lightTheme.typography[token].lineHeight,
      }),
    );
  },
);

it("SHOULD render the Text with bold weight", () => {
  setup({ bold: true, mode: TextMode.Body });

  expect(
    screen.getByTestId(defaultProps.testID).props.style.fontWeight,
  ).toEqual("700");
});

it("SHOULD apply tabular numerals WHEN tabular is set", () => {
  setup({ mode: TextMode.Body, tabular: true });

  expect(
    screen.getByTestId(defaultProps.testID).props.style.fontVariant,
  ).toEqual(["tabular-nums"]);
});

it("SHOULD throw an error if an invalid mode is passed", () => {
  function func() {
    return setup({ mode: "invalid" as TextMode });
  }

  expect(func).toThrow("Invalid mode");
});
