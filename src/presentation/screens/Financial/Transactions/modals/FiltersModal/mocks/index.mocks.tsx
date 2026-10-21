import { fireEvent, render, screen } from "@tests";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import TagDTO from "@application/dto/financial/TagDTO";
import * as theme from "@presentation/theme";
import useFilterOptions from "@screens/Financial/Transactions/hooks/useFilterOptions";
import { EMPTY_FILTERS } from "@screens/Financial/Transactions/models/transactionFilters";

import FiltersModal from "../index";
import { FiltersModalParams } from "../useFiltersModalViewModel";

jest.mock("@screens/Financial/Transactions/hooks/useFilterOptions");

function category(id: string, name: string, parentId?: string, extra = {}) {
  return new CategoryDTO({
    icon: "cart",
    id,
    name,
    owner: "USER",
    ownerId: "user-id",
    parentId,
    type: "EXPENSE",
    ...extra,
  });
}

const options = {
  categories: [],
  categoryDtos: [
    category("market", "Market"),
    category("greens", "Greens", "market"),
    category("butcher", "Butcher", "market"),
    category("gym", "Gym", undefined, { status: "ARCHIVED" }),
  ],
  sources: [
    {
      archived: false,
      id: "acc-1",
      kind: "ACCOUNT" as const,
      name: "Checking",
    },
    { archived: false, id: "card-1", kind: "CARD" as const, name: "Main card" },
    { archived: true, id: "acc-old", kind: "ACCOUNT" as const, name: "Old" },
  ],
  tags: [
    new TagDTO({
      id: "tag-1",
      name: "fixo",
      owner: "USER",
      ownerId: "user-id",
    }),
  ],
};

const params: FiltersModalParams = {
  archivedOwnerIds: new Set(),
  filters: EMPTY_FILTERS,
  onApply: jest.fn(),
  onClose: jest.fn(),
  ownerIds: ["user-id"],
  scopeOwnerIds: ["user-id"],
};

function setup(
  overrides: Partial<FiltersModalParams> = {},
  breakpoint: "compact" | "expanded" = "expanded",
) {
  jest.mocked(theme.useBreakpoint).mockReturnValue(breakpoint);
  jest.mocked(useFilterOptions).mockReturnValue(options as never);

  return render(<FiltersModal {...params} {...overrides} />);
}

beforeEach(() => jest.clearAllMocks());

export { fireEvent, params, screen, setup };
