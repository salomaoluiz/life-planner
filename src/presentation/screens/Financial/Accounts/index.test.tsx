import { fireEvent, screen } from "@testing-library/react-native";
import { StyleSheet } from "react-native";

import { hasText } from "@tests";

import { makeAccountDTO, owners } from "./mocks/index.mocks";
import { makeEntries, setup } from "./mocks/screen.mocks";
import AccountUIModel from "./models/AccountUIModel";
import accountsTestIds from "./testIds";

it("SHOULD render skeletons WHEN loading", () => {
  setup({ isLoading: true });

  expect(screen.getAllByTestId("accounts-skeleton")).toHaveLength(6);
});

it("SHOULD render ErrorState with a retry that calls onRetry", () => {
  const onRetry = jest.fn();
  setup({ errorMessage: "boom", onRetry });

  expect(hasText("boom")).toBe(true);
  fireEvent.press(screen.getByText("common.actions.tryAgain"));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD render the empty state with a new account action", () => {
  const onAddPress = jest.fn();
  setup({ isEmpty: true, onAddPress });

  expect(hasText("financial.accounts.emptyTitle")).toBe(true);
  expect(screen.getByTestId(accountsTestIds.emptyState)).toBeOnTheScreen();
  fireEvent.press(screen.getAllByText("financial.accounts.new")[0]);
  expect(onAddPress).toHaveBeenCalledTimes(1);
});

it("SHOULD show the total label and amount and call onAddPress from the plus button", () => {
  const onAddPress = jest.fn();
  setup({ entries: makeEntries(), onAddPress, totalAmount: { value: 12345 } });

  expect(hasText("financial.accounts.total")).toBe(true);
  expect(screen.getByTestId("accounts-total")).toBeTruthy();
  fireEvent.press(screen.getByTestId(accountsTestIds.addButton));
  expect(onAddPress).toHaveBeenCalledTimes(1);
});

it("SHOULD render the section, rows with owner and balance", () => {
  setup({ entries: makeEntries() });

  expect(hasText("financial.accounts.active")).toBe(true);
  expect(hasText("Checking")).toBe(true);
  expect(hasText("Card")).toBe(true);
  expect(screen.getAllByText("Alice Test")).toHaveLength(2);
  expect(screen.getByTestId(accountsTestIds.screen)).toBeOnTheScreen();
  expect(screen.getAllByTestId(accountsTestIds.row)).toHaveLength(2);
  expect(screen.getAllByTestId(`${accountsTestIds.row}-title`)).toHaveLength(2);
  expect(screen.getAllByTestId(`${accountsTestIds.row}-balance`)).toHaveLength(
    2,
  );
});

it("SHOULD show the archived toggle with count and call onArchivedToggle", () => {
  const onArchivedToggle = jest.fn();
  setup({ entries: makeEntries(), onArchivedToggle });

  expect(hasText('financial.accounts.archived {"count":2}')).toBe(true);
  expect(screen.queryByText("Old")).toBeNull();
  fireEvent.press(screen.getByTestId(accountsTestIds.archivedToggle));
  expect(onArchivedToggle).toHaveBeenCalledTimes(1);
});

it("SHOULD show archived rows WHEN expanded", () => {
  setup({ entries: makeEntries(true) });

  expect(hasText("Old")).toBe(true);
});

it("SHOULD call onRowPress with the id WHEN a row is tapped", () => {
  const onRowPress = jest.fn();
  setup({ entries: makeEntries(), onRowPress });

  fireEvent.press(screen.getByText("Checking"));
  expect(onRowPress).toHaveBeenCalledWith("acc-1");
});

it("SHOULD show the total inside a card", () => {
  setup({ entries: makeEntries(), totalAmount: { value: 12345 } });

  expect(screen.getByTestId("accounts-total-card")).toBeTruthy();
});

it("SHOULD space the toolbar blocks and the list by 20 px", () => {
  setup({ entries: makeEntries() });

  const style = StyleSheet.flatten(
    screen.getByTestId("accounts-toolbar").props.style,
  );
  expect(style.gap).toBe(20);
  expect(style.paddingBottom).toBe(20);
});

it("SHOULD give every owner filter chip an id from its owner id", () => {
  setup({
    entries: makeEntries(),
    ownerChoices: [
      { labelKey: "financial.common.all", value: "ALL" },
      { label: "Test Family", value: "owner-2" },
    ],
  });

  expect(
    screen.getByTestId(`${accountsTestIds.ownerFilter}-owner-2`),
  ).toBeOnTheScreen();
});

it("SHOULD show the end-of-month total next to the current total", () => {
  setup({
    entries: makeEntries(),
    totalAmount: { value: 12345 },
    totalProjectedAmount: { value: 20000 },
  });

  expect(hasText("financial.accounts.totalProjected")).toBe(true);
  expect(screen.getByTestId(accountsTestIds.totalProjected)).toBeOnTheScreen();
});

it("SHOULD show the end-of-month line ONLY on rows whose projected balance differs", () => {
  setup({ entries: makeEntries() });
  expect(screen.queryByTestId(`${accountsTestIds.row}-projected`)).toBeNull();

  const projected = new AccountUIModel(
    makeAccountDTO({
      balance: 100,
      id: "acc-9",
      name: "Projected",
      projectedBalance: 130,
    }),
    owners,
  );
  setup({
    entries: [{ account: projected, key: "row-acc-9", kind: "row" }],
  });

  expect(
    screen.getByTestId(`${accountsTestIds.row}-projected`),
  ).toBeOnTheScreen();
});

describe("archived family selected (spec 042)", () => {
  it("SHOULD hide the new button AND show the read-only banner", () => {
    setup({ readOnly: true });

    expect(screen.queryByTestId(accountsTestIds.addButton)).toBeNull();
    expect(screen.getByTestId(accountsTestIds.readOnlyBanner)).toBeTruthy();
  });

  it("SHOULD show the read-only toast WHEN requested", () => {
    setup({ readOnly: true, toastVisible: true });

    expect(screen.getByTestId(accountsTestIds.readOnlyToast)).toBeTruthy();
  });

  it("SHOULD offer no add action in the empty state", () => {
    setup({ isEmpty: true, readOnly: true });

    expect(hasText("financial.accounts.new")).toBe(false);
  });
});
