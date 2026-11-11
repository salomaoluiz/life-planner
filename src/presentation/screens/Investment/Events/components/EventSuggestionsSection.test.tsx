import { fireEvent, screen } from "@testing-library/react-native";

import { hasText, render } from "@tests";

import { InvestmentOperationType } from "@domain/entities/investment/enums";
import {
  makeDetail,
  makeEventSuggestion,
  makeOperation,
} from "@screens/Investment/mocks/fixtures";
import investmentTestIds from "@screens/Investment/testIds";

import useEventSuggestionActions from "../hooks/useEventSuggestionActions";
import useEventSuggestions from "../hooks/useEventSuggestions";
import EventBanner from "./EventBanner";
import EventSuggestionsSection from "./EventSuggestionsSection";

jest.mock("../hooks/useEventSuggestionActions");
jest.mock("../hooks/useEventSuggestions");

const actions = {
  failure: undefined,
  isBusy: false,
  onApprove: jest.fn(),
  onEdit: jest.fn(),
  onReject: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(useEventSuggestionActions).mockReturnValue(actions);
});

describe("EventSuggestionsSection", () => {
  it("SHOULD render nothing without suggestions", () => {
    jest.mocked(useEventSuggestions).mockReturnValue([]);
    render(<EventSuggestionsSection asset={makeDetail()} />);

    expect(
      screen.queryByTestId(investmentTestIds.suggestions.event.section),
    ).toBeNull();
  });

  it("SHOULD list the suggestions with the count AND flag the sells after the data-com", () => {
    jest.mocked(useEventSuggestions).mockReturnValue([makeEventSuggestion()]);
    render(
      <EventSuggestionsSection
        asset={makeDetail({
          operations: [
            makeOperation({
              date: "2026-12-01",
              type: InvestmentOperationType.SELL,
            }),
          ],
        })}
      />,
    );

    expect(
      screen.getByTestId(investmentTestIds.suggestions.event.section),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(`${investmentTestIds.suggestions.event.row}-esug-1`),
    ).toBeOnTheScreen();
    expect(hasText("investment.suggestions.eventsSubtitle")).toBe(true);
    expect(
      screen.getByTestId(investmentTestIds.suggestions.event.pastHint),
    ).toBeOnTheScreen();
  });

  it("SHOULD show the failure of a decision", () => {
    jest.mocked(useEventSuggestions).mockReturnValue([makeEventSuggestion()]);
    jest.mocked(useEventSuggestionActions).mockReturnValue({
      ...actions,
      failure: { key: "investment.event.noPosition", params: { date: "x" } },
    });
    render(<EventSuggestionsSection asset={makeDetail()} />);

    expect(screen.getByText(/investment.event.noPosition/)).toBeOnTheScreen();
  });
});

describe("EventBanner", () => {
  it("SHOULD stay hidden without suggestions", () => {
    jest.mocked(useEventSuggestions).mockReturnValue([]);
    render(<EventBanner asset={makeDetail()} />);

    expect(screen.queryByTestId(investmentTestIds.event.banner)).toBeNull();
  });

  it("SHOULD warn about the oldest pending event AND open it from the action", () => {
    const early = makeEventSuggestion({ date: "2026-03-10", id: "early" });
    jest
      .mocked(useEventSuggestions)
      .mockReturnValue([makeEventSuggestion({ id: "late" }), early]);
    render(<EventBanner asset={makeDetail()} />);

    expect(
      screen.getByText(/investment.event.pendingBanner/),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(investmentTestIds.event.banner),
    ).toBeOnTheScreen();

    fireEvent.press(
      screen.getByTestId(`${investmentTestIds.event.banner}-action`),
    );
    expect(actions.onEdit).toHaveBeenCalledWith(early);
  });
});
