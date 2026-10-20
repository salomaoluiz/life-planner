import { fireEvent, screen } from "@tests";

import { setup, spies } from "./mocks/index.mocks";
import layoutTestIds from "./testIds";

it("SHOULD show the Finances overline AND the current section as title", () => {
  setup("/financial/categories");

  expect(screen.getByText("navigation.tabs.finances")).toBeOnTheScreen();
  expect(screen.getByText("financial.sections.categories")).toBeOnTheScreen();
});

it("SHOULD NOT render the segmented control", () => {
  setup();

  expect(screen.queryByTestId("financial.layout.segments")).toBeNull();
});

it("SHOULD wrap the header and the stack in the Screen", () => {
  setup();

  expect(screen.getByTestId("financial-layout")).toBeOnTheScreen();
});

it("SHOULD open the section picker WHEN the title is pressed on a narrow layout", () => {
  setup("/financial/accounts");

  const button = screen.getByTestId(
    `${layoutTestIds.sectionPicker}-title-button`,
  );
  expect(button.props.accessibilityLabel).toBe(
    'financial.sections.pickerA11yLabel {"section":"financial.sections.accounts"}',
  );
  fireEvent.press(button);

  expect(spies.push).toHaveBeenCalledWith("/financial/section_picker");
});

it("SHOULD render a plain title WHEN the layout is expanded", () => {
  setup("/financial/cards", "expanded");

  expect(screen.getByText("financial.sections.cards")).toBeOnTheScreen();
  expect(
    screen.queryByTestId(`${layoutTestIds.sectionPicker}-title-button`),
  ).toBeNull();
});
