import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import investmentTestIds from "@screens/Investment/testIds";

import { makeEventSuggestion, setup } from "./mocks/index.mocks";

const ids = investmentTestIds.suggestions;

beforeEach(() => jest.clearAllMocks());

it("SHOULD list the suggestions with the count AND go back", () => {
  const { vm } = setup();

  fireEvent.press(screen.getByTestId(ids.back));

  expect(hasText("investment.suggestions.title")).toBe(true);
  expect(hasText("investment.suggestions.subtitle")).toBe(true);
  expect(screen.getByTestId(`${ids.row}-sug-1`)).toBeOnTheScreen();
  expect(vm.onBack).toHaveBeenCalled();
});

it("SHOULD show the empty state", () => {
  setup({ count: 0, isEmpty: true, items: [] });

  expect(screen.getByTestId(ids.empty)).toBeOnTheScreen();
});

it("SHOULD show the loading AND the error with a retry", () => {
  setup({ isLoading: true, items: [] });
  expect(screen.queryByTestId(`${ids.row}-sug-1`)).toBeNull();

  const { vm } = setup({ errorMessage: "boom", items: [] });
  fireEvent.press(screen.getByText("common.actions.tryAgain"));

  expect(vm.onRetry).toHaveBeenCalled();
});

it("SHOULD show the failure of a decision", () => {
  setup({
    actions: {
      failure: { key: "investment.income.errors.incomplete" },
      isBusy: false,
      onApprove: jest.fn(),
      onEdit: jest.fn(),
      onReject: jest.fn(),
    },
  });

  expect(hasText("investment.income.errors.incomplete")).toBe(true);
});

describe("corporate events (spec 108)", () => {
  it("SHOULD show the three tabs with their counts AND change the filter", () => {
    const { vm } = setup({ counts: { all: 3, events: 2, income: 1 } });

    expect(screen.getByTestId(ids.tabs)).toBeOnTheScreen();
    expect(screen.getByText(/investment.suggestions.tabAll/)).toBeOnTheScreen();
    expect(
      screen.getByText(/investment.suggestions.tabEvents/),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByText(/investment.suggestions.tabEvents/));

    expect(vm.onFilterChange).toHaveBeenCalledWith("EVENT");
  });

  it("SHOULD list the event suggestions AND decide them", () => {
    const { vm } = setup({ eventItems: [makeEventSuggestion()], items: [] });

    fireEvent.press(screen.getByTestId(`${ids.event.approve}-esug-1`));

    expect(screen.getByTestId(`${ids.event.row}-esug-1`)).toBeOnTheScreen();
    expect(vm.eventActions.onApprove).toHaveBeenCalledWith(
      makeEventSuggestion(),
    );
  });

  it("SHOULD use the event copy WHEN the events tab is open AND is empty", () => {
    setup({ eventItems: [], filter: "EVENT", isEmpty: true, items: [] });

    expect(hasText("investment.suggestions.eventsEmpty")).toBe(true);
    expect(hasText("investment.suggestions.eventsSubtitle")).toBe(true);
  });

  it("SHOULD show the failure of an event decision", () => {
    setup({
      eventActions: {
        failure: { key: "investment.event.noPosition", params: { date: "x" } },
        isBusy: false,
        onApprove: jest.fn(),
        onEdit: jest.fn(),
        onReject: jest.fn(),
      },
    });

    expect(screen.getByText(/investment.event.noPosition/)).toBeOnTheScreen();
  });
});
