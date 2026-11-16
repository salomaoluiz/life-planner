import { fireEvent, render, screen } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import SectionHeader from "./index";

function setBreakpoint(value: "compact" | "expanded" | "medium") {
  jest.requireMock("@presentation/theme").useBreakpoint.mockReturnValue(value);
}

beforeEach(() => {
  jest.clearAllMocks();
  setBreakpoint("compact");
});

it("SHOULD show the module as the overline AND the section as the title", () => {
  render(<SectionHeader section="overview" />);

  expect(screen.getByText("navigation.tabs.investments")).toBeOnTheScreen();
  expect(screen.getByText("investment.sections.overview")).toBeOnTheScreen();
});

it.each(["compact", "medium"] as const)(
  "SHOULD open the section picker WHEN the title is pressed on %s",
  (breakpoint) => {
    setBreakpoint(breakpoint);
    render(<SectionHeader section="assets" />);

    fireEvent.press(
      screen.getByTestId("investment.layout.section-picker-title-button"),
    );

    expect(modalNavigation.openModal).toHaveBeenCalledWith("section_picker");
  },
);

it("SHOULD keep a plain title WHEN the side menu is the picker (expanded)", () => {
  setBreakpoint("expanded");
  render(<SectionHeader section="assets" />);

  fireEvent.press(screen.getByText("investment.sections.assets"));

  expect(modalNavigation.openModal).not.toHaveBeenCalled();
});

it("SHOULD render the actions of the screen", () => {
  render(
    <SectionHeader actions={<></>} section="overview" testID="custom-header" />,
  );

  expect(screen.getByTestId("custom-header-title")).toBeOnTheScreen();
});
