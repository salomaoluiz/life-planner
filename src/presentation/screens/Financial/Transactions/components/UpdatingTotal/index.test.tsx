import { render, screen } from "@tests";

import { Text } from "@components";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import UpdatingTotal from "./index";

it("SHOULD render only the children WHEN not updating", () => {
  render(
    <UpdatingTotal>
      <Text.Body value={"R$ 10"} />
    </UpdatingTotal>,
  );
  expect(screen.getByText("R$ 10")).toBeTruthy();
  expect(screen.queryByTestId(transactionsTestIds.totalsUpdating)).toBeNull();
});

it("SHOULD keep the old value AND add the Updating spinner WHEN updating", () => {
  render(
    <UpdatingTotal updating>
      <Text.Body value={"R$ 10"} />
    </UpdatingTotal>,
  );
  expect(screen.getByText("R$ 10")).toBeTruthy();
  expect(screen.getByTestId(transactionsTestIds.totalsUpdating)).toBeTruthy();
  expect(
    screen.getByLabelText("financial.transactions.totals.updating"),
  ).toBeTruthy();
});
