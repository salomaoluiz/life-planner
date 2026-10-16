import { render } from "@tests";

import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import {
  CreditCardSummaryDTO,
  InvoiceDTO,
} from "@application/dto/financial/CreditCardOverviewDTO";

import FinancialCards from "../";
import { useCardsViewModel } from "../hooks";
import { CardEntry } from "../models/cardList";

jest.mock("../hooks");
jest.mock("@shopify/flash-list", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return {
    FlashList: ({
      data,
      ListEmptyComponent,
      ListHeaderComponent,
      renderItem,
      ...props
    }: {
      data?: unknown[];
      ListEmptyComponent?: React.ReactNode;
      ListHeaderComponent?: React.ReactNode;
      renderItem: (info: { item: unknown }) => React.ReactNode;
    }) => (
      <MockView testID="flashList" {...props}>
        {ListHeaderComponent}
        {data?.length === 0 && ListEmptyComponent}
        {data?.map((item, index) => (
          <MockView key={index}>{renderItem({ item })}</MockView>
        ))}
      </MockView>
    ),
  };
});

function makeCard(
  overrides: Partial<ConstructorParameters<typeof CreditCardDTO>[0]> = {},
) {
  return new CreditCardDTO({
    brand: "VISA",
    closingDay: 31,
    color: "#6366F1",
    dueDay: 10,
    id: "card-1",
    lastDigits: "1234",
    limit: 500000,
    owner: "USER",
    ownerId: "owner-1",
    status: "ACTIVE",
    title: "Main card",
    ...overrides,
  });
}

function makeInvoice(
  overrides: Partial<ConstructorParameters<typeof InvoiceDTO>[0]> = {},
) {
  return new InvoiceDTO({
    amount: 0,
    closingDate: "2026-10-31",
    dueDate: "2026-11-10",
    listDate: "2026-11-05",
    paymentAfterDue: false,
    paymentDate: "2026-11-05",
    periodEnd: "2026-10-31",
    periodStart: "2026-10-01",
    referenceMonth: "2026-10",
    status: "OPEN",
    ...overrides,
  });
}

function makeSummary(card = makeCard()) {
  return new CreditCardSummaryDTO({
    available: card.limit,
    card,
    closedInvoices: [],
    openInvoice: makeInvoice(),
    upcomingInvoices: [],
    used: 0,
  });
}

const defaultViewModel: ReturnType<typeof useCardsViewModel> = {
  aggregate: { available: 0, totalLimit: 0, used: 0 },
  entries: [],
  errorMessage: undefined,
  hasCards: false,
  invoiceTab: "open",
  isLoading: false,
  isRefreshing: false,
  onAddPress: jest.fn(),
  onArchivedCardPress: jest.fn(),
  onArchivedToggle: jest.fn(),
  onCardSelect: jest.fn(),
  onEditPress: jest.fn(),
  onInvoicePress: jest.fn(),
  onInvoiceTabChange: jest.fn(),
  onOwnerFilterChange: jest.fn(),
  onRefresh: jest.fn(),
  onRetry: jest.fn(),
  ownerChoices: [{ labelKey: "financial.common.all", value: "ALL" }],
  ownerFilter: "ALL",
  ownerName: () => "Alice Test",
  selected: undefined,
  selectedId: undefined,
  summaries: [],
  usedProgress: 0,
};

function setup(overrides: Partial<typeof defaultViewModel> = {}) {
  jest
    .mocked(useCardsViewModel)
    .mockReturnValue({ ...defaultViewModel, ...overrides });

  return render(<FinancialCards />);
}

function withCards(): Partial<typeof defaultViewModel> {
  const summary = makeSummary();
  const entries: CardEntry[] = [
    {
      cardId: summary.card.id,
      invoice: summary.openInvoice,
      key: "invoice-1",
      kind: "invoice",
    },
  ];

  return {
    aggregate: { available: 500000, totalLimit: 500000, used: 0 },
    entries,
    hasCards: true,
    selected: summary,
    selectedId: summary.card.id,
    summaries: [summary],
  };
}

export {
  defaultViewModel,
  makeCard,
  makeInvoice,
  makeSummary,
  setup,
  withCards,
};
