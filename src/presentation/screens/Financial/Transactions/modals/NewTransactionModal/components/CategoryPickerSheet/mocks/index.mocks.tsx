import { render } from "@tests";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import { buildCategoryRows } from "@screens/Financial/models/categoryTree";

import CategoryPickerSheet from "../";

const handlers = {
  onClose: jest.fn(),
  onQueryChange: jest.fn(),
  onSelect: jest.fn(),
};

function category(id: string, parentId?: string) {
  return new CategoryDTO({
    icon: "food",
    iconColor: "#F59E0B",
    id,
    name: id,
    owner: "USER",
    ownerId: "user-id",
    parentId,
    type: "EXPENSE",
  } as never);
}

const rows = buildCategoryRows([
  category("food"),
  category("market", "food"),
  category("rent"),
]);

function setup(
  props: Partial<React.ComponentProps<typeof CategoryPickerSheet>> = {},
) {
  render(
    <CategoryPickerSheet
      closeLabel={"Close"}
      query={""}
      rows={rows}
      searchPlaceholder={"Search"}
      title={"Choose category"}
      {...handlers}
      {...props}
    />,
  );

  return handlers;
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { rows, setup };
