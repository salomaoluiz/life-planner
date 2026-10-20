import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import {
  makeCard,
  makeInvoice,
  makeSummary,
  setup,
  withCards,
} from "./mocks/index.mocks";
import cardsTestIds from "./testIds";

it("SHOULD render skeletons WHEN loading", () => {
  setup({ isLoading: true });

  expect(screen.getAllByTestId("cards-skeleton")).toHaveLength(2);
});

it("SHOULD render ErrorState with a retry that calls onRetry", () => {
  const onRetry = jest.fn();
  setup({ errorMessage: "boom", onRetry });

  expect(hasText("boom")).toBe(true);
  fireEvent.press(screen.getByText("common.actions.tryAgain"));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

it("SHOULD render the empty state with an add action WHEN there are no cards", () => {
  const onAddPress = jest.fn();
  setup({ hasCards: false, onAddPress });

  expect(screen.getByTestId(cardsTestIds.emptyState)).toBeOnTheScreen();
  expect(hasText("financial.cards.empty.title")).toBe(true);
  fireEvent.press(screen.getByText("financial.cards.empty.action"));
  expect(onAddPress).toHaveBeenCalledTimes(1);
});

it("SHOULD show the total limit, the progress bar AND call onAddPress from the plus button", () => {
  const onAddPress = jest.fn();
  setup({ ...withCards(), onAddPress });

  expect(hasText("financial.cards.totalLimit")).toBe(true);
  expect(screen.getByTestId(cardsTestIds.totalLimit)).toBeTruthy();
  expect(screen.getByTestId("cards-progress")).toBeTruthy();
  fireEvent.press(screen.getByTestId(cardsTestIds.addButton));
  expect(onAddPress).toHaveBeenCalledTimes(1);
});

it("SHOULD not show the empty state WHEN only archived cards exist", () => {
  setup({ hasCards: true });

  expect(screen.queryByTestId(cardsTestIds.emptyState)).toBeNull();
});

it("SHOULD render one tile per card with the accessibility label and select on press", () => {
  const onCardSelect = jest.fn();
  setup({ ...withCards(), onCardSelect });

  const tile = screen.getByTestId(cardsTestIds.tile);

  expect(tile.props.accessibilityLabel).toContain("financial.cards.tileLabel");
  fireEvent.press(tile);
  expect(onCardSelect).toHaveBeenCalledWith("card-1");
});

it("SHOULD show the open invoice with its dates and pay-on line", () => {
  setup(withCards());

  expect(screen.getByTestId(cardsTestIds.invoiceRow)).toBeOnTheScreen();
  expect(
    hasText('financial.cards.invoice.dates {"closing":"31/10","due":"10/11"}'),
  ).toBe(true);
  expect(hasText('financial.cards.invoice.payOn {"date":"05/11"}')).toBe(true);
  expect(screen.queryByTestId(`${cardsTestIds.invoiceRow}-warning`)).toBeNull();
});

it("SHOULD show the warning badge WHEN the payment is after the due date", () => {
  const summary = makeSummary();
  setup({
    ...withCards(),
    entries: [
      {
        cardId: "card-1",
        invoice: makeInvoice({ paymentAfterDue: true }),
        key: "k",
        kind: "invoice",
      },
    ],
    selected: summary,
  });

  expect(
    screen.getByTestId(`${cardsTestIds.invoiceRow}-warning`),
  ).toBeOnTheScreen();
});

it("SHOULD switch the invoice tab AND open the editor from the edit button", () => {
  const onInvoiceTabChange = jest.fn();
  const onEditPress = jest.fn();
  setup({ ...withCards(), onEditPress, onInvoiceTabChange });

  fireEvent.press(screen.getByText("financial.cards.closed"));
  fireEvent.press(screen.getByTestId(cardsTestIds.editButton));

  expect(onInvoiceTabChange).toHaveBeenCalledWith("closed");
  expect(onEditPress).toHaveBeenCalledTimes(1);
});

it("SHOULD show the no closed invoices text", () => {
  setup({
    ...withCards(),
    entries: [{ key: "no-closed", kind: "noClosed" }],
    invoiceTab: "closed",
  });

  expect(screen.getByTestId(cardsTestIds.noClosed)).toBeOnTheScreen();
});

it("SHOULD show the archived toggle AND rows that open the form", () => {
  const onArchivedToggle = jest.fn();
  const onArchivedCardPress = jest.fn();
  setup({
    entries: [
      { count: 1, expanded: true, key: "t", kind: "archivedToggle" },
      {
        card: makeCard({ id: "old", status: "ARCHIVED", title: "Old" }),
        key: "r",
        kind: "archivedRow",
      },
    ],
    hasCards: true,
    onArchivedCardPress,
    onArchivedToggle,
  });

  fireEvent.press(screen.getByTestId(cardsTestIds.archivedToggle));
  fireEvent.press(screen.getByTestId(cardsTestIds.row));

  expect(onArchivedToggle).toHaveBeenCalledTimes(1);
  expect(onArchivedCardPress).toHaveBeenCalledWith("old");
  expect(hasText('financial.cards.archived {"count":1}')).toBe(true);
  expect(hasText("Old")).toBe(true);
});

describe("upcoming and pay (spec 029)", () => {
  it("SHOULD offer the Upcoming tab AND report it", () => {
    const onInvoiceTabChange = jest.fn();
    setup({ ...withCards(), onInvoiceTabChange });

    fireEvent.press(screen.getByText("financial.cards.upcoming"));

    expect(onInvoiceTabChange).toHaveBeenCalledWith("upcoming");
  });

  it("SHOULD show the no upcoming text", () => {
    setup({
      ...withCards(),
      entries: [{ key: "no-upcoming", kind: "noUpcoming" }],
      invoiceTab: "upcoming",
    });

    expect(screen.getByTestId(cardsTestIds.noUpcoming)).toBeOnTheScreen();
  });

  it("SHOULD show Pay only on a closed invoice with an amount AND open the invoice on press", () => {
    const onInvoicePress = jest.fn();
    const summary = makeSummary();
    setup({
      ...withCards(),
      entries: [
        {
          cardId: "card-1",
          invoice: makeInvoice({ amount: 45000, status: "CLOSED" }),
          key: "closed",
          kind: "invoice",
        },
        {
          cardId: "card-1",
          invoice: makeInvoice({
            amount: 0,
            referenceMonth: "2026-09",
            status: "CLOSED",
          }),
          key: "closed-zero",
          kind: "invoice",
        },
        {
          cardId: "card-1",
          invoice: summary.openInvoice,
          key: "open",
          kind: "invoice",
        },
      ],
      onInvoicePress,
    });

    expect(screen.getAllByTestId(cardsTestIds.invoicePay)).toHaveLength(1);
    fireEvent.press(screen.getByTestId(cardsTestIds.invoicePay));
    expect(onInvoicePress).toHaveBeenCalledWith("card-1", "2026-10");
  });
});

it("SHOULD open the refund and the early payment sheets from the card header (spec 032)", () => {
  const onRefundPress = jest.fn();
  const onEarlyPaymentPress = jest.fn();
  setup({ ...withCards(), onEarlyPaymentPress, onRefundPress });

  fireEvent.press(screen.getByTestId(cardsTestIds.refundButton));
  fireEvent.press(screen.getByTestId(cardsTestIds.earlyPaymentButton));

  expect(onRefundPress).toHaveBeenCalledTimes(1);
  expect(onEarlyPaymentPress).toHaveBeenCalledTimes(1);
});

it("SHOULD show the read-only banner AND toast, and hide the card actions WHEN an archived family is selected", () => {
  setup({ ...withCards(), readOnly: true, toastVisible: true });

  expect(screen.getByTestId(cardsTestIds.readOnlyBanner)).toBeTruthy();
  expect(screen.getByTestId(cardsTestIds.readOnlyToast)).toBeTruthy();
  expect(screen.queryByTestId(cardsTestIds.addButton)).toBeNull();
  expect(screen.queryByTestId(cardsTestIds.editButton)).toBeNull();
  expect(screen.queryByTestId(cardsTestIds.refundButton)).toBeNull();
  expect(screen.queryByTestId(cardsTestIds.earlyPaymentButton)).toBeNull();
});
