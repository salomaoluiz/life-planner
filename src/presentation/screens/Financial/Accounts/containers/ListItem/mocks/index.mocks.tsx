import { render } from "@tests";

import { IAccountDTO } from "@application/dto/financial/AccountDTO";

import ListItem from "../";
import { makeAccountViewModel } from "../../../mocks/index.mocks";
import useListItem from "../hooks";

jest.mock("../hooks");

// region mocks
const onDelete = jest.fn();
const onEdit = jest.fn();
const refetch = jest.fn();
// endregion mocks

// region spies
const spies = {
  useListItem: jest.mocked(useListItem),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  spies.useListItem.mockReturnValue({ onDelete, onEdit });
});

function setup(overrides: Partial<IAccountDTO> = {}) {
  const item = makeAccountViewModel(overrides);

  render(<ListItem item={item} refetch={refetch} />);

  return { item };
}

const mocks = { onDelete, onEdit, refetch };

export { mocks, setup, spies };
export { fireEvent, hasText, screen } from "@tests";
