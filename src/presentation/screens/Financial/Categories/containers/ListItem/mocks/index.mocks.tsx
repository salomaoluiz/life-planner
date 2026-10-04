import { render } from "@tests";

import { ICategoryDTO } from "@application/dto/financial/CategoryDTO";

import ListItem from "../";
import { makeCategoryViewModel } from "../../../mocks/index.mocks";
import useListItem from "../hooks";

jest.mock("../hooks");
jest.mock("@presentation/i18n/useTranslation", () => ({
  __esModule: true,
  default: () => ({ t: (key: string) => key }),
}));

// region mocks
const onDelete = jest.fn();
const refetch = jest.fn();
// endregion mocks

// region spies
const spies = {
  useListItem: jest.mocked(useListItem),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  spies.useListItem.mockReturnValue({ onDelete });
});

function setup(overrides: Partial<ICategoryDTO> = {}) {
  const item = makeCategoryViewModel(overrides);

  render(<ListItem item={item} refetch={refetch} />);

  return { item };
}

const mocks = { onDelete, refetch };

export { mocks, setup, spies };
export { fireEvent, hasText, screen } from "@tests";
