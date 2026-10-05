import { GenericError } from "@domain/entities/errors";
import FinancialCategoryViewModel from "@screens/Financial/Categories/models/FinancialCategoryViewModel";

import {
  act,
  fireEvent,
  hasText,
  mocks,
  screen,
  setup,
  spies,
} from "./mocks/screen.mocks";

function filter(value: string) {
  act(() => {
    screen.UNSAFE_getByType(mocks.Picker).props.onValueChange(value);
  });
}

function titles() {
  return screen.getAllByTestId("listItem").map((row) => row.props.title);
}

it("SHOULD render the loading text WHEN fetching", () => {
  setup({ isFetching: true });

  expect(hasText("Loading...")).toBe(true);
  expect(screen.queryByTestId("flashList")).not.toBeOnTheScreen();
});

it("SHOULD render the error message WHEN the query failed", () => {
  setup({ error: true });

  expect(hasText(`Error ${new GenericError().message}`)).toBe(true);
  expect(screen.queryByTestId("flashList")).not.toBeOnTheScreen();
});

it("SHOULD render the categories as a hierarchy with children after their parent", () => {
  setup({ items: mocks.items });

  expect(titles()).toEqual(["Transport", "Uber", "Salary"]);
});

it("SHOULD render an empty list WHEN there is no data", () => {
  setup();

  expect(screen.getByTestId("flashList")).toBeOnTheScreen();
  expect(screen.queryAllByTestId("listItem")).toHaveLength(0);
});

it("SHOULD offer the all, expense and income filters with ALL selected", () => {
  setup({ items: mocks.items });
  const picker = screen.UNSAFE_getByType(mocks.Picker);

  expect(picker.props.selectedValue).toBe("ALL");
  expect(picker.props.items).toEqual([
    { label: "financial.categories.all", value: "ALL" },
    { label: "financial.categories.expense", value: "EXPENSE" },
    { label: "financial.categories.income", value: "INCOME" },
  ]);
});

it("SHOULD only show expense categories WHEN filtering by EXPENSE", () => {
  setup({ items: mocks.items });

  filter("EXPENSE");

  expect(titles()).toEqual(["Transport", "Uber"]);
});

it("SHOULD only show income categories WHEN filtering by INCOME", () => {
  setup({ items: mocks.items });

  filter("INCOME");

  expect(titles()).toEqual(["Salary"]);
});

it("SHOULD show everything again WHEN the filter goes back to ALL", () => {
  setup({ items: mocks.items });

  filter("INCOME");
  filter("ALL");

  expect(titles()).toHaveLength(3);
});

it("SHOULD pass refetch to every list item", () => {
  const { refetch } = setup({ items: mocks.items });

  fireEvent.press(screen.getAllByTestId("listItem")[0]);

  expect(refetch).toHaveBeenCalled();
});

it("SHOULD set the refresh button as header WHEN not fetching", () => {
  const { refetch } = setup();

  expect(mocks.setOptions).toHaveBeenCalledTimes(1);
  const { headerRight } = mocks.setOptions.mock.calls[0][0];
  expect(headerRight().props.refetchQuery).toBe(refetch);
});

it("SHOULD NOT set the header WHEN fetching", () => {
  setup({ isFetching: true });

  expect(mocks.setOptions).not.toHaveBeenCalled();
});

it("SHOULD refetch WHEN the screen is focused", () => {
  const { refetch } = setup({ focused: true });

  expect(refetch).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT refetch WHEN the screen is not focused", () => {
  const { refetch } = setup({ focused: false });

  expect(refetch).not.toHaveBeenCalled();
});

it("SHOULD open the add-category modal WHEN the add button is pressed", () => {
  setup();

  fireEvent.press(screen.getByTestId("categories-add-button"));

  expect(spies.push).toHaveBeenCalledWith(
    "/financial/category/add_new_category",
  );
});

it("SHOULD build view models with their owners WHEN fetching", async () => {
  setup();
  const { cacheKey, fetch } = spies.useQuery.mock.calls[0][0];
  spies.getOwners.mockResolvedValue(mocks.owners);
  spies.getCategories.mockResolvedValue(mocks.dtos);

  const result = (await fetch()) as FinancialCategoryViewModel[];

  expect(cacheKey).toEqual(["get_categories"]);
  expect(spies.getCategories).toHaveBeenCalledWith(["owner-1", "owner-2"]);
  expect(result.map((vm) => vm.name)).toEqual(["Uber", "Transport", "Salary"]);
});
