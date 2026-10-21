import { fireEvent, screen } from "@testing-library/react-native";

import { render } from "@tests";

import { isWeb } from "@utils/platform";

import TruncatedText from "./index";

jest.mock("@utils/platform", () => ({ isWeb: jest.fn() }));

it("SHOULD wrap to 2 lines before cutting the text", () => {
  jest.mocked(isWeb).mockReturnValue(false);
  render(<TruncatedText testID="text" value="A very long header" />);

  expect(screen.getByTestId("text").props.numberOfLines).toBe(2);
});

it("SHOULD show the full text in a tooltip on web", () => {
  jest.mocked(isWeb).mockReturnValue(true);
  render(
    <TruncatedText testID="text" tooltipTestID="full" value="Casa › Mercado" />,
  );

  fireEvent(screen.getByTestId("text").parent!.parent!, "hoverIn");
  expect(screen.getByTestId("full")).toBeTruthy();
});

it("SHOULD pick the text style by variant", () => {
  jest.mocked(isWeb).mockReturnValue(false);
  render(<TruncatedText testID="text" value="x" variant="caption" />);

  expect(screen.getByTestId("text")).toBeTruthy();
});
