import { fireEvent, screen } from "@testing-library/react-native";

import { render } from "@tests";

import { InvestmentIncomeStatus } from "@domain/entities/investment/enums";
import {
  makeDetail,
  makeIncome,
  makeSuggestion,
} from "@screens/Investment/mocks/fixtures";
import investmentTestIds from "@screens/Investment/testIds";

import { IncomeSectionVM, useIncomeSectionViewModel } from "../hooks";
import IncomeSection from "./IncomeSection";

jest.mock("../hooks");

const ids = investmentTestIds.income;

const base: IncomeSectionVM = {
  filter: "ALL",
  isLoading: false,
  items: [],
  onAdd: jest.fn(),
  onEdit: jest.fn(),
  onFilterChange: jest.fn(),
  onReceive: jest.fn(),
  suggestionActions: {
    failure: undefined,
    isBusy: false,
    onApprove: jest.fn(),
    onEdit: jest.fn(),
    onReject: jest.fn(),
  },
  suggestions: [],
  summary: undefined,
  today: "2026-11-11",
};

function setup(overrides: Partial<IncomeSectionVM> = {}) {
  const vm = { ...base, ...overrides };
  jest.mocked(useIncomeSectionViewModel).mockReturnValue(vm);

  return {
    vm,
    ...render(
      <IncomeSection
        accountNames={new Map([["acc-1", "Broker"]])}
        asset={makeDetail()}
      />,
    ),
  };
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD show the empty state AND add an income", () => {
  const { vm } = setup();

  expect(screen.getByText(/investment.income.section.empty/)).toBeOnTheScreen();
  fireEvent.press(screen.getByText("investment.income.addButton"));

  expect(vm.onAdd).toHaveBeenCalled();
});

it("SHOULD list a received income AND a planned one with the confirm button", () => {
  const { vm } = setup({
    items: [
      makeIncome(),
      makeIncome({
        id: "income-2",
        overdue: true,
        status: InvestmentIncomeStatus.PLANNED,
      }),
    ],
    summary: {
      currency: "BRL",
      pendingSuggestions: 0,
      plannedTotal: 7140,
      receivedThisYear: 7140,
    },
  });

  expect(screen.getByTestId(`${ids.row}-income-1`)).toBeOnTheScreen();
  expect(screen.queryByTestId(`${ids.receive}-income-1`)).toBeNull();
  expect(screen.getByTestId(ids.summaryReceived)).toBeOnTheScreen();
  expect(
    screen.getByText("investment.income.status.OVERDUE"),
  ).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(`${ids.receive}-income-2`));
  fireEvent.press(screen.getByTestId(`${ids.edit}-income-1`));

  expect(vm.onReceive).toHaveBeenCalledWith("income-2");
  expect(vm.onEdit).toHaveBeenCalledWith("income-1");
});

it("SHOULD show a row without account AND without per-unit value", () => {
  setup({
    items: [
      makeIncome({
        accountId: undefined,
        amountPerUnit: undefined,
        estimatedWithheld: 0,
      }),
    ],
  });

  expect(screen.getByText(/investment.income.row.noAccount/)).toBeOnTheScreen();
});

it("SHOULD show the pending suggestions on top AND the failure of a decision", () => {
  setup({
    suggestionActions: {
      ...base.suggestionActions,
      failure: { key: "investment.income.errors.incomplete" },
    },
    suggestions: [makeSuggestion()],
  });

  expect(
    screen.getByTestId(`${investmentTestIds.suggestions.row}-sug-1`),
  ).toBeOnTheScreen();
  expect(
    screen.getByText("investment.income.errors.incomplete"),
  ).toBeOnTheScreen();
});

it("SHOULD change the filter", () => {
  const { vm } = setup();

  fireEvent.press(screen.getByText("investment.income.filter.PLANNED"));

  expect(vm.onFilterChange).toHaveBeenCalledWith("PLANNED");
});
