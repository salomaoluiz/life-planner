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
    screen.getByText(/home.finance.breakdown.current.*R\$1,000\.00/),
  ).toBeOnTheScreen();
  expect(screen.getByText(/^\+ R\$300\.00$/)).toBeOnTheScreen();
  expect(screen.getByText(/^− R\$500\.00$/)).toBeOnTheScreen();
  expect(
    screen.getByText("home.finance.breakdown.toReceive"),
  ).toBeOnTheScreen();
  expect(screen.getByText("home.finance.breakdown.toPay")).toBeOnTheScreen();

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

describe("favorite account (spec 094)", () => {
  const favorite = new AccountDTO({
    balance: 1000,
    icon: "bank",
    id: "a1",
    isFavorite: true,
    name: "Checking",
    owner: "USER",
    ownerId: "o1",
    status: "ACTIVE",
  });

  function favoriteModel() {
    return new FinanceBalanceUIModel(
      new MonthSummaryDTO({
        balance: 0,
        byAccount: {
          a1: {
            expense: 90000,
            income: 200000,
            toPay: 20000,
            toReceive: 30000,
          },
        },
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
            accounts: [{ accountId: "a1", balanceCents: 80000 }],
            cardsDueCents: 0,
            date: "2026-11-30",
            projected: true,
            totalCents: 123456,
          },
        ],
        month: "2026-11",
      }),
      [favorite],
      new Date(2026, 10, 12),
      "en-US",
      favorite,
    );
  }

  function renderCard(data: FinanceBalanceUIModel) {
    render(
      <FinanceBalanceCard
        onPress={jest.fn()}
        state={{ data, isError: false, isLoading: false, onRetry: jest.fn() }}
      />,
    );
  }

  it("SHOULD show a badge with the favorite name AND the total of accounts as a muted line", () => {
    renderCard(favoriteModel());

    expect(
      screen.getByTestId(`${homeTestIds.financeFavoriteBadge}-label`),
    ).toHaveTextContent("Checking");
    expect(
      screen.getByText(/home.finance.totalOfAccounts.*R\$1,234\.56/),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(homeTestIds.financeProjectedBalance),
    ).toHaveTextContent(/800/);
  });

  it("SHOULD show no badge and no total line WHEN there is no favorite", () => {
    renderCard(model(80000));

    expect(
      screen.queryByTestId(homeTestIds.financeFavoriteBadge),
    ).not.toBeOnTheScreen();
    expect(
      screen.queryByTestId(homeTestIds.financeTotalOfAccounts),
    ).not.toBeOnTheScreen();
  });
});
