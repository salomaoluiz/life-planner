import { useIsFocused } from "@react-navigation/native";
import { router } from "expo-router";

import { renderHook } from "@tests";

import CreditCardDTO from "@application/dto/financial/CreditCardDTO";
import CreditCardOverviewDTO, {
  CreditCardSummaryDTO,
  InvoiceDTO,
} from "@application/dto/financial/CreditCardOverviewDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import useCardsViewModel from "../useCardsViewModel";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    getFinancialCreditCardsOverviewUseCase: {
      execute: jest.fn(),
      uniqueName: "overview",
    },
    getFinancialCreditCardsUseCase: { execute: jest.fn(), uniqueName: "cards" },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" },
  },
}));

// region mocks
const owners = [
  new OwnerDTO({ id: "user-id", name: "Alice Test", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Test Family", type: OwnerType.FAMILY }),
];

function card(
  id: string,
  limit: number,
  status = "ACTIVE",
  ownerId = "user-id",
) {
  return new CreditCardDTO({
    brand: "VISA",
    closingDay: 5,
    color: "#6366F1",
    dueDay: 8,
    id,
    limit,
    owner: ownerId === "user-id" ? "USER" : "FAMILY",
    ownerId,
    status,
    title: id,
  });
}

function invoice(referenceMonth: string) {
  return new InvoiceDTO({
    amount: 0,
    closingDate: `${referenceMonth}-05`,
    dueDate: `${referenceMonth}-08`,
    listDate: `${referenceMonth}-08`,
    paymentAfterDue: false,
    paymentDate: `${referenceMonth}-08`,
    periodEnd: `${referenceMonth}-05`,
    periodStart: `${referenceMonth}-01`,
    referenceMonth,
    status: "OPEN",
  });
}

function summary(dto: CreditCardDTO, used = 0) {
  return new CreditCardSummaryDTO({
    available: dto.limit - used,
    card: dto,
    closedInvoices: [invoice("2026-09")],
    openInvoice: invoice("2026-10"),
    upcomingInvoices: [],
    used,
  });
}

const cardsQuery = new UseQueryFixture<{
  cards: CreditCardDTO[];
  overview: CreditCardOverviewDTO;
  owners: OwnerDTO[];
}>();
// endregion mocks

// region spies
const spies = {
  getCards: jest.mocked(useCases.getFinancialCreditCardsUseCase.execute),
  getOverview: jest.mocked(
    useCases.getFinancialCreditCardsOverviewUseCase.execute,
  ),
  getOwners: jest.mocked(useCases.getOwnersUseCase.execute),
  isFocused: jest.mocked(useIsFocused),
  push: jest.mocked(router.push),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  cardsQuery.reset();
  spies.isFocused.mockReturnValue(false);
  spies.useQuery.mockImplementation((() => cardsQuery.build()) as never);
});

// Active cards feed the overview, ARCHIVED ones only the list (like the API).
function givenData(cards: CreditCardDTO[], used = 0) {
  const overview = new CreditCardOverviewDTO({
    aggregate: { available: 0, totalLimit: 0, used: 0 },
    cards: cards
      .filter((item) => item.status === "ACTIVE")
      .map((item) => summary(item, used)),
  });

  cardsQuery.withData({ cards, overview, owners });
}

function setup() {
  return renderHook(() => useCardsViewModel());
}

export { card, cardsQuery, givenData, invoice, owners, setup, spies, summary };
