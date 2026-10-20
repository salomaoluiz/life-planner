import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import { rows, setup } from "./mocks/screen.mocks";
import tagsTestIds from "./testIds";

it("SHOULD render skeletons WHEN loading", () => {
  setup({ isLoading: true });

  expect(screen.getAllByTestId("tags-skeleton")).toHaveLength(6);
});

it("SHOULD render ErrorState with a retry that calls onRetry", () => {
  const onRetry = jest.fn();
  setup({ errorMessage: "boom", onRetry });

  expect(hasText("boom")).toBe(true);
  fireEvent.press(screen.getByText("common.actions.tryAgain"));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD render the empty state with a new tag action", () => {
  const onAddPress = jest.fn();
  setup({ isEmpty: true, onAddPress });

  expect(screen.getByTestId(tagsTestIds.emptyState)).toBeOnTheScreen();
  expect(hasText("financial.tags.empty")).toBe(true);
  fireEvent.press(screen.getAllByText("financial.tags.new")[0]);
  expect(onAddPress).toHaveBeenCalledTimes(1);
});

it("SHOULD show name, usage and scope of each row", () => {
  setup({ rows });

  expect(hasText("gasto-fixo")).toBe(true);
  expect(hasText('financial.tags.usage_other {"count":24}')).toBe(true);
  expect(hasText('financial.tags.usage_one {"count":1}')).toBe(true);
  expect(hasText("financial.tags.unused")).toBe(true);
  expect(screen.getAllByTestId(tagsTestIds.scopeAll)).toHaveLength(1);
  expect(screen.getAllByTestId(tagsTestIds.ownerBadge)).toHaveLength(2);
  expect(hasText("Test Family")).toBe(true);
});

it("SHOULD open a row AND the add button", () => {
  const onRowPress = jest.fn();
  const onAddPress = jest.fn();
  setup({ onAddPress, onRowPress, rows });

  fireEvent.press(screen.getByText("viagem"));
  fireEvent.press(screen.getByTestId(tagsTestIds.addButton));

  expect(onRowPress).toHaveBeenCalledWith("t2");
  expect(onAddPress).toHaveBeenCalledTimes(1);
});

it("SHOULD report the scope filter change", () => {
  const onOwnerFilterChange = jest.fn();
  setup({ onOwnerFilterChange, rows });

  fireEvent.press(screen.getByTestId(`${tagsTestIds.ownerFilter}-family-1`));

  expect(onOwnerFilterChange).toHaveBeenCalledWith("family-1");
});

it("SHOULD hide the add button AND show the banner WHEN read-only", () => {
  setup({ readOnly: true, rows });

  expect(screen.queryByTestId(tagsTestIds.addButton)).toBeNull();
  expect(screen.getByTestId(tagsTestIds.readOnlyBanner)).toBeOnTheScreen();
});

it("SHOULD hide the empty action WHEN read-only", () => {
  setup({ isEmpty: true, readOnly: true });

  expect(screen.queryByText("financial.tags.new")).toBeNull();
});
