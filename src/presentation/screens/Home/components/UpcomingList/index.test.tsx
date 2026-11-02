import { StyleSheet } from "react-native";

import { fireEvent, render, screen } from "@tests";

import UpcomingDTO, {
  UpcomingItemDTO,
} from "@application/dto/home/UpcomingDTO";
import UpcomingUIModel from "@screens/Home/models/UpcomingUIModel";
import homeTestIds from "@screens/Home/testIds";

import UpcomingList from "./";

const now = new Date(2026, 10, 12, 10);

function item(
  date: string,
  overrides: Partial<UpcomingItemDTO> = {},
): UpcomingItemDTO {
  return {
    accountId: "account-id",
    categoryId: "category-id",
    creditCardId: null,
    currency: "BRL",
    date,
    description: `Bill ${date}`,
    id: `id-${date}`,
    invoiceMonth: null,
    kind: "TRANSACTION",
    occurrenceNumber: null,
    owner: "USER",
    ownerId: "owner-id",
    purchaseCount: null,
    recurrenceId: null,
    type: "EXPENSE",
    valueCents: 1000,
    ...overrides,
  };
}
function model(overdue: UpcomingItemDTO[], next: UpcomingItemDTO[]) {
  return new UpcomingUIModel(
    new UpcomingDTO({
      next,
      nextTotal: next.length,
      overdue,
      overdueExpenseCents: 3000,
    }),
    now,
    "en-US",
  );
}

const handlers = {
  onAddTransactionPress: jest.fn(),
  onInvoicePress: jest.fn(),
  onItemPress: jest.fn(),
  onSeeAllPress: jest.fn(),
};

function renderLoaded(data: UpcomingUIModel) {
  render(
    <UpcomingList
      {...handlers}
      state={{ data, isError: false, isLoading: false, onRetry: jest.fn() }}
    />,
  );
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD render skeleton rows WHILE loading", () => {
  render(
    <UpcomingList
      {...handlers}
      state={{ isError: false, isLoading: true, onRetry: jest.fn() }}
    />,
  );

  expect(
    screen.getAllByTestId(homeTestIds.financeUpcomingLoading).length,
  ).toBeGreaterThan(0);
});

it("SHOULD render the error with a retry of this block only", () => {
  const onRetry = jest.fn();

  render(
    <UpcomingList
      {...handlers}
      state={{ isError: true, isLoading: false, onRetry }}
    />,
  );
  fireEvent.press(screen.getByText("common.actions.tryAgain"));

  expect(onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD show the all-set empty state with a way to add a transaction", () => {
  renderLoaded(model([], []));

  expect(
    screen.getByTestId(homeTestIds.financeUpcomingEmpty),
  ).toBeOnTheScreen();

  fireEvent.press(screen.getByText("home.upcoming.newTransaction"));

  expect(handlers.onAddTransactionPress).toHaveBeenCalledTimes(1);
});

it("SHOULD list the overdue group with its header and the next group", () => {
  renderLoaded(
    model([item("2026-11-01"), item("2026-11-11")], [item("2026-11-13")]),
  );

  expect(
    screen.getByTestId(homeTestIds.financeUpcomingOverdueHeader),
  ).toHaveTextContent(/home.upcoming.overdue \{"count":2\}/);
  expect(screen.getByText('home.upcoming.next {"count":1}')).toBeOnTheScreen();
  expect(screen.getAllByTestId(homeTestIds.financeUpcomingItem)).toHaveLength(
    3,
  );
  expect(
    screen.getByText('home.upcoming.overdueDays_one {"count":1}'),
  ).toBeOnTheScreen();
  expect(
    screen.getByText('home.upcoming.overdueDays_other {"count":11}'),
  ).toBeOnTheScreen();
});

it("SHOULD open a transaction WHEN pressing its row", () => {
  renderLoaded(model([], [item("2026-11-13")]));

  fireEvent.press(screen.getByTestId(homeTestIds.financeUpcomingItem));

  expect(handlers.onItemPress).toHaveBeenCalledWith(
    expect.objectContaining({ id: "id-2026-11-13" }),
  );
});

it("SHOULD show an invoice as one row with a See transactions button", () => {
  renderLoaded(
    model(
      [],
      [
        item("2026-11-15", {
          creditCardId: "card-id",
          description: "Main card",
          invoiceMonth: "2026-11",
          kind: "INVOICE",
          purchaseCount: 23,
        }),
      ],
    ),
  );

  expect(
    screen.getByText('home.upcoming.invoice {"card":"Main card"}'),
  ).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(homeTestIds.financeUpcomingInvoiceButton));

  expect(handlers.onInvoicePress).toHaveBeenCalledWith(
    expect.objectContaining({
      creditCardId: "card-id",
      invoiceMonth: "2026-11",
    }),
  );
  expect(handlers.onItemPress).not.toHaveBeenCalled();
});

it("SHOULD scroll inside a labelled box with a capped height", () => {
  renderLoaded(model([item("2026-11-01")], []));

  const box = screen.getByLabelText("home.upcoming.listLabel");

  expect(StyleSheet.flatten(box.props.style).maxHeight).toBeGreaterThan(0);
  expect(box.props.nestedScrollEnabled).toBe(true);
});

it("SHOULD open the transactions screen WHEN pressing See all", () => {
  renderLoaded(model([], [item("2026-11-13")]));

  fireEvent.press(screen.getByText("common.actions.seeAll"));

  expect(handlers.onSeeAllPress).toHaveBeenCalledTimes(1);
});
