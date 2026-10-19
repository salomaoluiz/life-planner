import { screen } from "@testing-library/react-native";

import { hasText, render } from "@tests";

import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import DayBalanceLine from "./index";

it("SHOULD render the account name, its balance AND the account test id", () => {
  render(
    <DayBalanceLine
      accountId="a1"
      balanceCents={157000}
      icon="bank"
      isCards={false}
      name="Checking"
    />,
  );

  expect(
    screen.getByTestId(`${transactionsTestIds.dayBalanceLine}-a1`),
  ).toBeOnTheScreen();
  expect(hasText("Checking")).toBe(true);
});

it("SHOULD render the card invoices line with its own test id AND a negative amount", () => {
  render(
    <DayBalanceLine
      balanceCents={-45000}
      icon="credit-card-outline"
      isCards
      name=""
    />,
  );

  expect(
    screen.getByTestId(transactionsTestIds.dayBalanceCards),
  ).toBeOnTheScreen();
  expect(hasText("financial.transactions.dayBalance.cardsDue")).toBe(true);
});
