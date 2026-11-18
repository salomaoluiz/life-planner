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

it("SHOULD show the module as the overline and the section as the title, or a custom title", () => {
  render(<SectionHeader section="lists" />);

  expect(screen.getByText("navigation.tabs.stock")).toBeOnTheScreen();
  expect(screen.getByText("stock.sections.lists")).toBeOnTheScreen();
  screen.unmount();

  render(<SectionHeader section="lists" subtitle="3 items" title="Mercado" />);
  expect(screen.getByText("Mercado")).toBeOnTheScreen();
  expect(screen.getByText("3 items")).toBeOnTheScreen();
});

it.each(["compact", "medium"] as const)(
  "SHOULD open the section picker WHEN the title is pressed on %s",
  (breakpoint) => {
    setBreakpoint(breakpoint);
    render(<SectionHeader section="items" />);

    fireEvent.press(
      screen.getByTestId("stock.layout.section-picker-title-button"),
    );

    expect(modalNavigation.openModal).toHaveBeenCalledWith("section_picker");
  },
);

it("SHOULD keep a plain title WHEN the side menu is the picker (expanded)", () => {
  setBreakpoint("expanded");
  render(<SectionHeader section="catalog" />);

  fireEvent.press(screen.getByText("stock.sections.catalog"));

  expect(modalNavigation.openModal).not.toHaveBeenCalled();
});
