import { render } from "@tests";

import {
  makeEventSuggestion,
  makeSuggestion,
} from "@screens/Investment/mocks/fixtures";

import Suggestions from "../";
import { SuggestionsVM, useSuggestionsViewModel } from "../hooks";

jest.mock("../hooks");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const defaultViewModel: SuggestionsVM = {
  actions: {
    failure: undefined,
    isBusy: false,
    onApprove: jest.fn(),
    onEdit: jest.fn(),
    onReject: jest.fn(),
  },
  count: 1,
  counts: { all: 1, events: 0, income: 1 },
  errorMessage: undefined,
  eventActions: {
    failure: undefined,
    isBusy: false,
    onApprove: jest.fn(),
    onEdit: jest.fn(),
    onReject: jest.fn(),
  },
  eventItems: [],
  filter: "ALL",
  isEmpty: false,
  isLoading: false,
  items: [makeSuggestion()],
  onBack: jest.fn(),
  onFilterChange: jest.fn(),
  onRetry: jest.fn(),
  today: "2026-11-11",
};

function setup(overrides: Partial<SuggestionsVM> = {}) {
  const vm = { ...defaultViewModel, ...overrides };
  jest.mocked(useSuggestionsViewModel).mockReturnValue(vm);

  return { vm, ...render(<Suggestions />) };
}

export { defaultViewModel, makeEventSuggestion, setup };
