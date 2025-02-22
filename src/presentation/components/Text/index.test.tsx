import { setup, defaultProps } from "./mocks";
import { screen } from "@tests";
import { TextMode } from "@components/Text/types";
import { lightTheme } from "@presentation/theme/provider";

it("SHOULD render the Text with the correct props", () => {
  setup();

  const component = screen.getByTestId(defaultProps.testID);

  expect(component.props).toEqual({
    children: "Text Label",
    variant: TextMode.Body,
    testID: "default-text",
    style: expect.any(Object),
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

it.each<{
  modeString: keyof typeof TextMode;
  fontSize: keyof (typeof lightTheme)["sizes"]["fontSizes"];
  lineHeight: keyof (typeof lightTheme)["sizes"]["lineHeights"];
}>([
  { modeString: "Display", fontSize: "xxlarge", lineHeight: "xxlarge" },
  { modeString: "Headline", fontSize: "xlarge", lineHeight: "xlarge" },
  { modeString: "Title", fontSize: "large", lineHeight: "large" },
  { modeString: "Body", fontSize: "medium", lineHeight: "medium" },
  { modeString: "Label", fontSize: "small", lineHeight: "small" },
  { modeString: "Caption", fontSize: "xsmall", lineHeight: "xsmall" },
])(
  "SHOULD render the Text.$modeString with the correct styles",
  ({ modeString, fontSize, lineHeight }) => {
    const mode = TextMode[modeString];

    setup({ mode });

    const component = screen.getByTestId(defaultProps.testID);

    expect(component.props.style).toEqual({
      fontSize: lightTheme.sizes.fontSizes[fontSize],
      lineHeight: lightTheme.sizes.lineHeights[lineHeight],
    });
  },
);

it("SHOULD throw an error if an invalid mode is passed", () => {
  function func() {
    return setup({ mode: "invalid" as TextMode });
  }

  expect(func).toThrow("Invalid mode");
});
