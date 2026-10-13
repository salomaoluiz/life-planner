import { render } from "@tests";

import TransactionRow from "../";
import { categories, makeTransactionDTO } from "../../../mocks/index.mocks";
import TransactionUIModel from "../../../models/TransactionUIModel";

const onPress = jest.fn();
const item = new TransactionUIModel(
  makeTransactionDTO({ value: "12.50" }),
  categories[0],
);

function setup() {
  render(<TransactionRow item={item} onPress={onPress} />);

  return { item, onPress };
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { setup };
