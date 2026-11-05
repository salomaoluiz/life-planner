import { fireEvent, render, screen, within } from "@tests";

import DailyBalanceDTO from "@application/dto/financial/DailyBalanceDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import LowestBalanceUIModel from "@screens/Home/models/LowestBalanceUIModel";
import homeTestIds from "@screens/Home/testIds";

import LowestBalanceTiles from "./";

const now = new Date(2026, 10, 12, 10);
const account = {
  icon: "bank",
  id: "a1",
  name: "Checking",
  owner: OwnerType.USER,
  ownerId: "o1",
};

function day(date: string, total: number) {
  return {
    accounts: [{ accountId: "a1", balanceCents: total }],
    cardsDueCents: 0,
    date,
    projected: false,
    totalCents: total,
  };
}
function model(withAccounts = true) {
  const list = withAccounts ? [account] : [];

  return new LowestBalanceUIModel(
    new DailyBalanceDTO({
      accounts: list,
      days: withAccounts ? [day("2026-11-25", 121030)] : [],
      month: "2026-11",
    }),
    new DailyBalanceDTO({
      accounts: list,
      days: withAccounts ? [day("2026-12-10", -34000)] : [],
      month: "2026-12",
    }),
    now,
    "en-US",
  );
}

const handlers = { onCreateAccountPress: jest.fn(), onPress: jest.fn() };

function renderLoaded(data: LowestBalanceUIModel) {
  render(
    <LowestBalanceTiles
      {...handlers}
      state={{ data, isError: false, isLoading: false, onRetry: jest.fn() }}
    />,
  );
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD render the skeleton WHILE loading and the error with a retry", () => {
  const onRetry = jest.fn();
  const { rerender } = render(
    <LowestBalanceTiles
      {...handlers}
      state={{ isError: false, isLoading: true, onRetry }}
    />,
  );

  expect(
    screen.getByTestId(homeTestIds.financeLowestLoading),
  ).toBeOnTheScreen();

  rerender(
    <LowestBalanceTiles
      {...handlers}
      state={{ isError: true, isLoading: false, onRetry }}
    />,
  );
  fireEvent.press(screen.getByText("common.actions.tryAgain"));

  expect(onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD show a tile for this month and one for next month and open the Overview on press", () => {
  renderLoaded(model());

  expect(
    screen.getByTestId(homeTestIds.financeLowestCurrent),
  ).toBeOnTheScreen();
  expect(screen.getByTestId(homeTestIds.financeLowestNext)).toBeOnTheScreen();
  expect(
    screen.getByText('home.finance.lowest.day {"day":10,"month":"December"}'),
  ).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(homeTestIds.financeLowestNext));

  expect(handlers.onPress).toHaveBeenCalledTimes(1);
});

it("SHOULD expand the balance by account WHEN pressing the chevron and collapse it again", () => {
  renderLoaded(model());

  expect(
    screen.queryByTestId(homeTestIds.financeLowestDetail),
  ).not.toBeOnTheScreen();

  fireEvent.press(
    screen.getByTestId(`${homeTestIds.financeLowestToggle}-next`),
  );

  expect(screen.getByTestId(homeTestIds.financeLowestDetail)).toBeOnTheScreen();
  expect(screen.getByText("Checking")).toBeOnTheScreen();

  fireEvent.press(
    screen.getByTestId(`${homeTestIds.financeLowestToggle}-next`),
  );

  expect(
    screen.queryByTestId(homeTestIds.financeLowestDetail),
  ).not.toBeOnTheScreen();
});

it("SHOULD say there is no active account and offer to create one", () => {
  renderLoaded(model(false));

  expect(screen.getByText("home.finance.lowest.noAccounts")).toBeOnTheScreen();
  expect(
    screen.queryByTestId(homeTestIds.financeLowestCurrent),
  ).not.toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(homeTestIds.financeLowestCreateAccount));

  expect(handlers.onCreateAccountPress).toHaveBeenCalledTimes(1);
});

describe("favorite account (spec 094 FR 29)", () => {
  function favoriteModel() {
    const list = [
      account,
      {
        icon: "piggy-bank",
        id: "a2",
        name: "Savings",
        owner: OwnerType.USER,
        ownerId: "o1",
      },
    ];
    function days(date: string, a1: number, a2: number) {
      return {
        accounts: [
          { accountId: "a1", balanceCents: a1 },
          { accountId: "a2", balanceCents: a2 },
        ],
        cardsDueCents: 0,
        date,
        projected: false,
        totalCents: a1 + a2,
      };
    }

    return new LowestBalanceUIModel(
      new DailyBalanceDTO({
        accounts: list,
        days: [days("2026-11-25", -51960, 400000)],
        month: "2026-11",
      }),
      new DailyBalanceDTO({
        accounts: list,
        days: [days("2026-12-10", 32000, 1)],
        month: "2026-12",
      }),
      now,
      "en-US",
      { id: "a1", name: "Checking" },
    );
  }

  it("SHOULD name the favorite in the title AND show ITS lowest balance in the tile", () => {
    renderLoaded(favoriteModel());

    expect(
      screen.getByText('home.finance.lowest.titleFavorite {"name":"Checking"}'),
    ).toBeOnTheScreen();
    expect(screen.queryByText("home.finance.lowest.title")).toBeNull();
    expect(
      screen.getByTestId(homeTestIds.financeLowestCurrent),
    ).toHaveTextContent(/519/);
  });

  it("SHOULD list the favorite first in the detail AND end with the total of the filter", () => {
    renderLoaded(favoriteModel());
    fireEvent.press(
      screen.getByTestId(`${homeTestIds.financeLowestToggle}-current`),
    );

    const detail = screen.getByTestId(homeTestIds.financeLowestDetail);

    expect(
      within(detail).getByTestId(
        "financial.transactions.day-balance-line-a1-favorite",
      ),
    ).toBeOnTheScreen();
    expect(detail).toHaveTextContent(/3,480\.40|3\.480,40/);
  });
});
