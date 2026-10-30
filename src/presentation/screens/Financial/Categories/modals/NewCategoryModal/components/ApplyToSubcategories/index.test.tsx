import { fireEvent, render, screen } from "@tests";

import categoryFormTestIds from "@screens/Financial/Categories/modals/NewCategoryModal/testIds";

import ApplyToSubcategories from "./index";

const labels = {
  archivedSuffix: "(archived)",
  colorHint: "Each group gets a tone",
  colorSwitch: "Color",
  iconHint: "Same icon",
  iconSwitch: "Icon",
  keeps: "keeps",
  offHint: "Off: only Food changes.",
  preview: "Preview",
  root: "root",
  title: "Apply to subcategories",
};
const preview = [
  {
    archived: false,
    depth: 0,
    icon: "food",
    id: "p",
    name: "Food",
    tint: "#3B82F6",
  },
  {
    archived: false,
    depth: 1,
    icon: "food",
    id: "a",
    name: "Market",
    tint: "#5B9CF8",
    tone: 1,
  },
  {
    archived: true,
    depth: 1,
    icon: "food",
    id: "b",
    name: "Bakery",
    tint: "#5B9CF8",
    tone: 1,
  },
  {
    archived: false,
    depth: 2,
    icon: "food",
    id: "c",
    name: "Snacks",
    tint: "#6366F1",
  },
];

function renderIt(overrides = {}) {
  const onColorToggle = jest.fn();
  const onIconToggle = jest.fn();

  render(
    <ApplyToSubcategories
      colorOn
      colorSwitchVisible
      compact={false}
      description="Applies to the 3 subcategories of Food, archived included."
      iconOn={false}
      iconSwitchVisible
      labels={labels}
      onColorToggle={onColorToggle}
      onIconToggle={onIconToggle}
      preview={preview}
      toneLabel={(number) => `tone ${number}`}
      {...overrides}
    />,
  );

  return { onColorToggle, onIconToggle };
}

it("SHOULD show the title, the count text, both switches and the preview with tags", () => {
  renderIt();

  expect(screen.getByTestId(categoryFormTestIds.applyToChildren)).toBeTruthy();
  expect(screen.getByText("Apply to subcategories")).toBeTruthy();
  expect(screen.getByText(/Applies to the 3 subcategories/)).toBeTruthy();
  expect(screen.getByTestId(categoryFormTestIds.applyColorSwitch)).toBeTruthy();
  expect(screen.getByTestId(categoryFormTestIds.applyIconSwitch)).toBeTruthy();
  expect(screen.getByTestId(categoryFormTestIds.applyPreview)).toBeTruthy();
  expect(screen.getByText("root")).toBeTruthy();
  expect(screen.getAllByText("tone 1")).toHaveLength(2);
  expect(screen.getByText("keeps")).toBeTruthy();
  expect(screen.getByText("Bakery (archived)")).toBeTruthy();
});

it("SHOULD show only the switches whose field changed", () => {
  renderIt({ iconSwitchVisible: false });

  expect(screen.getByTestId(categoryFormTestIds.applyColorSwitch)).toBeTruthy();
  expect(screen.queryByTestId(categoryFormTestIds.applyIconSwitch)).toBeNull();
});

it("SHOULD report the toggles", () => {
  const { onColorToggle, onIconToggle } = renderIt();

  fireEvent(
    screen.getByTestId(categoryFormTestIds.applyColorSwitch),
    "valueChange",
    false,
  );
  fireEvent(
    screen.getByTestId(categoryFormTestIds.applyIconSwitch),
    "valueChange",
    true,
  );

  expect(onColorToggle).toHaveBeenCalled();
  expect(onIconToggle).toHaveBeenCalled();
});

it("SHOULD use chips on a compact screen and the off hint when both switches are off", () => {
  renderIt({ compact: true });

  expect(screen.getByText("Market")).toBeTruthy();
  expect(screen.queryByText("Preview")).toBeNull();
  expect(screen.queryByText(/Applies to the 3/)).toBeNull();
});

it("SHOULD say only the category changes WHEN compact and both switches are off", () => {
  renderIt({ colorOn: false, compact: true, iconOn: false });

  expect(screen.getByText("Off: only Food changes.")).toBeTruthy();
  expect(screen.queryByText("Market")).toBeNull();
});
