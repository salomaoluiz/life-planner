import { render } from "@tests";

import { ITransactionDTO } from "@application/dto/financial/TransactionDTO";

import ListItem from "../";
import { makeTransactionViewModel } from "../../../mocks/index.mocks";
import useListItem from "../hooks";
import WebListItem from "../index.web";

jest.mock("../hooks");

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

function setup(
  overrides: Partial<ITransactionDTO> = {},
  variant: "native" | "web" = "native",
) {
  const item = makeTransactionViewModel(overrides);
  const Component = variant === "web" ? WebListItem : ListItem;

  render(<Component item={item} refetch={refetch} />);

  return { item };
}

const mocks = { onDelete, refetch };

export { mocks, setup, spies };
export { fireEvent, hasText, screen } from "@tests";
