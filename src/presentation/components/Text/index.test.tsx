import { screen } from "@tests";

import { TextMode } from "@components/Text/types";
import { lightTheme } from "@presentation/theme/provider";

import { defaultProps, setup } from "./mocks";

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

it.each<{
  fontSize: keyof (typeof lightTheme)["sizes"]["fontSizes"];
  lineHeight: keyof (typeof lightTheme)["sizes"]["lineHeights"];
  modeString: keyof typeof TextMode;
}>([
  { fontSize: "xxlarge", lineHeight: "xxlarge", modeString: "Display" },
  { fontSize: "xlarge", lineHeight: "xlarge", modeString: "Headline" },
  { fontSize: "large", lineHeight: "large", modeString: "Title" },
  { fontSize: "medium", lineHeight: "medium", modeString: "Body" },
  { fontSize: "small", lineHeight: "small", modeString: "Label" },
  { fontSize: "xsmall", lineHeight: "xsmall", modeString: "Caption" },
])(
  "SHOULD render the Text.$modeString with the correct styles",
  ({ fontSize, lineHeight, modeString }) => {
    const mode = TextMode[modeString];

    setup({ mode });

    const component = screen.getByTestId(defaultProps.testID);

    expect(component.props.style).toEqual([
      {
        color: lightTheme.colors.onPrimary,
        fontSize: lightTheme.sizes.fontSizes[fontSize],
        lineHeight: lightTheme.sizes.lineHeights[lineHeight],
      },
      {
        color: undefined,
        textAlign: undefined,
      },
    ]);
  },
);

it("SHOULD throw an error if an invalid mode is passed", () => {
  function func() {
    return setup({ mode: "invalid" as TextMode });
  }

  expect(func).toThrow("Invalid mode");
});
