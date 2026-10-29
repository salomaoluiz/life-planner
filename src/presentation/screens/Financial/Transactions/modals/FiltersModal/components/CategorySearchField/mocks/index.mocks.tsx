import { fireEvent, render, screen } from "@tests";

import {
  buildCategoryIndex,
  CategoryResult,
  PickerCategory,
} from "@screens/Financial/Transactions/models/categoryPicker";

import CategorySearchField, { CategorySearchFieldProps } from "../index";

function category(
  id: string,
  name: string,
  extra: Partial<PickerCategory> = {},
): PickerCategory {
  return { archived: false, id, name, type: "EXPENSE", ...extra };
}

const index = buildCategoryIndex([
  category("food", "Food", { iconColor: "#F5A524" }),
  category("market", "Market", { iconColor: "#F5A524", parentId: "food" }),
  category("old", "Market old", { archived: true }),
  category("sales", "Sales", { type: "INCOME" }),
]);

function entry(id: string) {
  const found = index.find((item) => item.category.id === id);

  if (!found) {
    throw new Error(id);
  }

  return found;
}

function result(id: string, coveredBy?: string): CategoryResult {
  return { coveredBy, entry: entry(id) };
}

const handlers = {
  onPick: jest.fn(),
  onQueryChange: jest.fn(),
  onRemove: jest.fn(),
};

function setup(props: Partial<CategorySearchFieldProps> = {}) {
  return render(
    <CategorySearchField
      chips={[]}
      dropdown={false}
      query={""}
      results={[]}
      {...handlers}
      {...props}
    />,
  );
}

beforeEach(() => jest.clearAllMocks());

export { fireEvent, handlers, result, screen, setup };
