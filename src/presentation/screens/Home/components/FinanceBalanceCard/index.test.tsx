import { fireEvent, render, screen } from "@tests";

import AccountDTO from "@application/dto/financial/AccountDTO";
import DailyBalanceDTO from "@application/dto/financial/DailyBalanceDTO";
import MonthSummaryDTO from "@application/dto/home/MonthSummaryDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import FinanceBalanceUIModel from "@screens/Home/models/FinanceBalanceUIModel";
import homeTestIds from "@screens/Home/testIds";

import FinanceBalanceCard from "./";

function model(projected: number) {
  return new FinanceBalanceUIModel(
    new MonthSummaryDTO({
      balance: 0,
      expense: 1088040,
      income: 1230000,
      toPay: 50000,
      toReceive: 30000,
    }),
    new DailyBalanceDTO({
      accounts: [
        {
          icon: "bank",
          id: "a1",
          name: "Checking",
          owner: OwnerType.USER,
          ownerId: "o1",
        },
      ],
      days: [
        {
          accounts: [],
          cardsDueCents: 0,
          date: "2026-11-30",
          projected: true,
          totalCents: projected,
        },
      ],
      month: "2026-11",
    }),
    [
      new AccountDTO({
        balance: 1000,
        icon: "bank",
        id: "a1",
        name: "Checking",
        owner: "USER",
        ownerId: "o1",
        status: "ACTIVE",
      }),
    ],
    new Date(2026, 10, 12),
    "en-US",
  );
}

it("SHOULD render the skeleton WHILE loading", () => {
  render(
    <FinanceBalanceCard
      onPress={jest.fn()}
      state={{ isError: false, isLoading: true, onRetry: jest.fn() }}
    />,
  );

  expect(
    screen.getByTestId(homeTestIds.financeBalanceLoading),
  ).toBeOnTheScreen();
});

it("SHOULD render the error with a retry", () => {
  const onRetry = jest.fn();

  render(
    <FinanceBalanceCard
      onPress={jest.fn()}
      state={{ isError: true, isLoading: false, onRetry }}
    />,
  );
  fireEvent.press(screen.getByText("common.actions.tryAgain"));

  expect(onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD show the projected balance, what it is made of and open the Overview on press", () => {
  const onPress = jest.fn();

  render(
    <FinanceBalanceCard
      onPress={onPress}
      state={{
        data: model(80000),
        isError: false,
        isLoading: false,
        onRetry: jest.fn(),
      }}
    />,
  );

  expect(
    screen.getByTestId(homeTestIds.financeProjectedBalance),
  ).toHaveTextContent(/800/);
  expect(
    screen.getByText(
      /home.finance.breakdown.*\$1,000\.00.*\$500\.00.*\$300\.00/,
    ),
  ).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(homeTestIds.financeBalance));

  expect(onPress).toHaveBeenCalledTimes(1);
});

it("SHOULD show a negative projected balance with the expense look", () => {
  render(
    <FinanceBalanceCard
      onPress={jest.fn()}
      state={{
        data: model(-12000),
        isError: false,
        isLoading: false,
        onRetry: jest.fn(),
      }}
    />,
  );

  expect(
    screen.getByTestId(homeTestIds.financeProjectedBalance),
  ).toHaveTextContent(/^−.*120/);
});
