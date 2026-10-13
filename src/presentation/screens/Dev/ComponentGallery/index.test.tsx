import { fireEvent, render, screen } from "@tests";

import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";
import { useTheme } from "@presentation/theme";

import ComponentGallery from "./";

jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

it("SHOULD render a section for every component group", () => {
  render(<ComponentGallery />);

  [
    "gallery-typography",
    "gallery-actions",
    "gallery-inputs",
    "gallery-display",
    "gallery-containers",
  ].forEach((id) => expect(screen.getByTestId(id)).toBeTruthy());
});

it("SHOULD toggle the theme with the switch", () => {
  const { setThemeMode } = useTheme();
  render(<ComponentGallery />);

  fireEvent(screen.getByTestId("gallery-theme-toggle"), "valueChange", true);

  expect(setThemeMode).toHaveBeenCalledWith(ThemeMode.DARK);
});

it("SHOULD open and close the sheet and the confirm dialog", () => {
  render(<ComponentGallery />);

  fireEvent.press(screen.getByTestId("gallery-open-sheet"));
  expect(screen.getByTestId("gallery-sheet")).toBeTruthy();
  fireEvent.press(screen.getByTestId("gallery-sheet-close"));
  expect(screen.queryByTestId("gallery-sheet")).toBeNull();

  fireEvent.press(screen.getByTestId("gallery-open-confirm"));
  expect(screen.getByTestId("gallery-confirm")).toBeTruthy();
});
