import { fireEvent, render, screen } from "@tests";

import categoryFormTestIds from "@screens/Financial/Categories/modals/NewCategoryModal/testIds";

import IconPickerSheet from "./";

const icons = [
  { label: "Folder", value: "folder" },
  { label: "File", value: "file-outline" },
];

function result(name: string) {
  return `${categoryFormTestIds.iconPickerResult}-${name}`;
}

function setup(overrides = {}) {
  const props = {
    clearLabel: "Clear",
    closeLabel: "Close",
    emptyHint: "Try another word.",
    emptyTitle: "No icon found",
    errorHint: "Common icons stay in the form.",
    errorTitle: "Could not search",
    groups: [{ icons, title: "Other" }],
    onClose: jest.fn(),
    onQueryChange: jest.fn(),
    onRetry: jest.fn(),
    onSelect: jest.fn(),
    query: "",
    resultLine: "2 icons for “file”",
    results: icons,
    retryLabel: "Try again",
    samples: ["folder", "file"],
    samplesLabel: "Try:",
    searchPlaceholder: "Search",
    selected: "folder",
    status: "success" as const,
    title: "Choose icon",
    wide: true,
    ...overrides,
  };

  render(<IconPickerSheet {...props} />);

  return props;
}

it("SHOULD show the grouped catalog WHEN there is no query", () => {
  setup();

  expect(screen.getByText("Other")).toBeOnTheScreen();
  expect(screen.getByTestId(result("folder"))).toBeOnTheScreen();
  expect(screen.queryByText("2 icons for “file”")).toBeNull();
});

it("SHOULD show the result line and the labelled results WHEN searching", () => {
  setup({ query: "file" });

  expect(screen.getByText("2 icons for “file”")).toBeOnTheScreen();
  expect(screen.getByText("File")).toBeOnTheScreen();
});

it("SHOULD report the typed text and the sample chips (web only)", () => {
  const props = setup();

  fireEvent.changeText(screen.getByPlaceholderText("Search"), "pa");
  fireEvent.press(screen.getByText("folder"));

  expect(props.onQueryChange).toHaveBeenCalledWith("pa");
  expect(props.onQueryChange).toHaveBeenCalledWith("folder");
});

it("SHOULD hide the sample chips on a compact screen", () => {
  setup({ wide: false });

  expect(screen.queryByText("Try:")).toBeNull();
});

it("SHOULD select an icon by its name", () => {
  const props = setup({ query: "file" });

  fireEvent.press(screen.getByTestId(result("file-outline")));

  expect(props.onSelect).toHaveBeenCalledWith("file-outline");
});

it("SHOULD show the empty state", () => {
  setup({ query: "zzz", results: [], status: "empty" });

  expect(
    screen.getByTestId(categoryFormTestIds.iconPickerEmpty),
  ).toBeOnTheScreen();
  expect(screen.getByText("No icon found")).toBeOnTheScreen();
  expect(screen.getByText("Try another word.")).toBeOnTheScreen();
});

it("SHOULD show the error state with a retry", () => {
  const props = setup({ status: "error" });

  expect(screen.getByText("Could not search")).toBeOnTheScreen();
  fireEvent.press(screen.getByText("Try again"));

  expect(props.onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD show no results while loading", () => {
  setup({ status: "loading" });

  expect(screen.queryByTestId(result("folder"))).toBeNull();
});
