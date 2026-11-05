import AccountDTO from "@application/dto/financial/AccountDTO";
import DailyBalanceDTO from "@application/dto/financial/DailyBalanceDTO";
import MonthSummaryDTO from "@application/dto/home/MonthSummaryDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import FinanceBalanceUIModel from "./FinanceBalanceUIModel";

const month = new Date(2026, 10, 12);

function account(id: string, balance: number) {
  return new AccountDTO({
    balance,
    icon: "bank",
    id,
    name: "Checking",
    owner: "USER",
    ownerId: "owner-1",
    status: "ACTIVE",
  });
}
function balances(lastTotal: number, withAccount = true) {
  return new DailyBalanceDTO({
    accounts: withAccount
      ? [
          {
            icon: "bank",
            id: "account-1",
            name: "Checking",
            owner: OwnerType.USER,
            ownerId: "owner-1",
          },
        ]
      : [],
    days: [
      {
        accounts: [],
        cardsDueCents: 0,
        date: "2026-11-30",
        projected: true,
        totalCents: lastTotal,
      },
      {
        accounts: [],
        cardsDueCents: 0,
        date: "2026-11-01",
        projected: false,
        totalCents: 999,
      },
    ],
    month: "2026-11",
  });
}
function summary(toReceive: number, toPay: number) {
  return new MonthSummaryDTO({
    balance: 0,
    expense: 1088040,
    income: 1230000,
    toPay,
    toReceive,
  });
}

it("SHOULD use the last day total as the projected balance and break it down (1.000 + 300 − 500 = 800)", () => {
  const model = new FinanceBalanceUIModel(
    summary(30000, 50000),
    balances(80000),
    [account("account-1", 1000)],
    month,
    "en-US",
  );

  expect(model.projectedValue).toBe(80000);
  expect(model.projectedType).toBeUndefined();
  expect(model.breakdown).toEqual({
    currentCents: 100000,
    toPayCents: 50000,
    toReceiveCents: 30000,
  });
  expect(model.income).toBe(1230000);
  expect(model.expense).toBe(1088040);
  expect(model.monthName).toBe("November");
});

it("SHOULD show a negative projected balance as an expense amount", () => {
  const model = new FinanceBalanceUIModel(
    summary(0, 0),
    balances(-12000),
    [account("account-1", 0)],
    month,
    "en-US",
  );

  expect(model.projectedValue).toBe(12000);
  expect(model.projectedType).toBe("EXPENSE");
});

it("SHOULD derive what is to pay WHEN the sources do not add up", () => {
  const model = new FinanceBalanceUIModel(
    summary(30000, 50000),
    balances(78000),
    [account("account-1", 1000)],
    month,
    "en-US",
  );

  expect(model.breakdown.toPayCents).toBe(52000);
});

it("SHOULD ignore accounts the balances do not cover (archived or out of the filter)", () => {
  const model = new FinanceBalanceUIModel(
    summary(0, 0),
    balances(100000),
    [account("account-1", 1000), account("other", 5000)],
    month,
    "en-US",
  );

  expect(model.breakdown.currentCents).toBe(100000);
});

it("SHOULD report there is no account WHEN the balances list none", () => {
  const model = new FinanceBalanceUIModel(
    summary(0, 0),
    balances(0, false),
    [],
    month,
    "en-US",
  );

  expect(model.hasAccounts).toBe(false);
});

describe("favorite account (spec 094)", () => {
  const favorite = new AccountDTO({
    balance: 1000,
    icon: "bank",
    id: "account-1",
    isFavorite: true,
    name: "Checking",
    owner: "USER",
    ownerId: "owner-1",
    status: "ACTIVE",
  });
  const totals = {
    expense: 90000,
    income: 200000,
    toPay: 20000,
    toReceive: 30000,
  };

  function withFavorite(
    favoriteEnd: number,
    byAccount: Record<string, typeof totals> = { "account-1": totals },
  ) {
    const dto = new DailyBalanceDTO({
      accounts: [
        {
          icon: "bank",
          id: "account-1",
          name: "Checking",
          owner: OwnerType.USER,
          ownerId: "owner-1",
        },
      ],
      days: [
        {
          accounts: [{ accountId: "account-1", balanceCents: favoriteEnd }],
          cardsDueCents: 0,
          date: "2026-11-30",
          projected: true,
          totalCents: 123456,
        },
        {
          accounts: [{ accountId: "account-1", balanceCents: 1 }],
          cardsDueCents: 0,
          date: "2026-11-01",
          projected: false,
          totalCents: 999,
        },
      ],
      month: "2026-11",
    });

    return new FinanceBalanceUIModel(
      new MonthSummaryDTO({
        balance: 0,
        byAccount,
        expense: 1088040,
        income: 1230000,
        toPay: 50000,
        toReceive: 30000,
      }),
      dto,
      [favorite],
      month,
      "en-US",
      favorite,
    );
  }

  it("SHOULD project the favorite's own balance on the last day AND keep the total apart", () => {
    const model = withFavorite(80000);

    expect(model.favoriteName).toBe("Checking");
    expect(model.projectedEndCents).toBe(80000);
    expect(model.projectedValue).toBe(80000);
    expect(model.totalProjectedCents).toBe(123456);
  });

  it("SHOULD build the breakdown from the favorite AND derive what is to pay so it adds up to the projected end", () => {
    const model = withFavorite(80000);

    expect(model.breakdown).toEqual({
      currentCents: 100000,
      toPayCents: 50000,
      toReceiveCents: 30000,
    });
  });

  it("SHOULD show the income and expenses of the favorite rows, plus the invoices the balances say it still pays", () => {
    const model = withFavorite(80000);

    expect(model.income).toBe(200000);
    // 90000 of rows + (50000 to pay − 20000 of rows to pay) that only the daily balances know about.
    expect(model.expense).toBe(120000);
  });

  it("SHOULD show zeros WHEN the favorite made no rows this month", () => {
    const model = withFavorite(100000, {});

    expect(model.income).toBe(0);
    expect(model.expense).toBe(0);
    expect(model.breakdown).toEqual({
      currentCents: 100000,
      toPayCents: 0,
      toReceiveCents: 0,
    });
  });

  it("SHOULD show a negative favorite end as an expense amount", () => {
    const model = withFavorite(-12000);

    expect(model.projectedValue).toBe(12000);
    expect(model.projectedType).toBe("EXPENSE");
  });

  it("SHOULD stay exactly as before WHEN there is no favorite", () => {
    const model = new FinanceBalanceUIModel(
      summary(30000, 50000),
      balances(80000),
      [account("account-1", 1000)],
      month,
      "en-US",
    );

    expect(model.favoriteName).toBeUndefined();
    expect(model.projectedEndCents).toBe(80000);
    expect(model.totalProjectedCents).toBe(80000);
    expect(model.expense).toBe(1088040);
  });
});
