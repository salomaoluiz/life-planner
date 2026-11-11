import { fireEvent, screen } from "@testing-library/react-native";

import { hasText, render } from "@tests";

import { InvestmentOperationType } from "@domain/entities/investment/enums";
import { makeEventSuggestion } from "@screens/Investment/mocks/fixtures";
import investmentTestIds from "@screens/Investment/testIds";

import EventSuggestionCard from "./EventSuggestionCard";

const ids = investmentTestIds.suggestions.event;

function actions() {
  return {
    failure: undefined,
    isBusy: false,
    onApprove: jest.fn(),
    onEdit: jest.fn(),
    onReject: jest.fn(),
  };
}

it("SHOULD call approve, edit AND reject with the suggestion", () => {
  const handlers = actions();
  const suggestion = makeEventSuggestion();

  render(
    <EventSuggestionCard
      actions={handlers}
      pastSells={false}
      suggestion={suggestion}
    />,
  );
  fireEvent.press(screen.getByTestId(`${ids.approve}-esug-1`));
  fireEvent.press(screen.getByTestId(`${ids.edit}-esug-1`));
  fireEvent.press(screen.getByTestId(`${ids.reject}-esug-1`));

  expect(handlers.onApprove).toHaveBeenCalledWith(suggestion);
  expect(handlers.onEdit).toHaveBeenCalledWith(suggestion);
  expect(handlers.onReject).toHaveBeenCalledWith(suggestion);
  expect(screen.queryByTestId(ids.pastHint)).toBeNull();
});

it("SHOULD describe a bonus: headline, 1 new for every N, the unit cost AND the position after", () => {
  render(
    <EventSuggestionCard
      actions={actions()}
      pastSells={false}
      suggestion={makeEventSuggestion()}
    />,
  );

  expect(screen.getByText(/investment.event.bonusHeadline/)).toBeOnTheScreen();
  expect(
    screen.getByText(/investment.event.bonusPercentHint/),
  ).toBeOnTheScreen();
  expect(screen.getByText(/investment.event.unitCostLine/)).toBeOnTheScreen();
  expect(hasText("investment.event.afterLabel")).toBe(true);
  expect(screen.getByText(/investment.event.afterValue/)).toBeOnTheScreen();
  expect(screen.getByText(/investment.event.afterAdded/)).toBeOnTheScreen();
  expect(screen.getByText(/investment.event.afterFraction/)).toBeOnTheScreen();
});

it("SHOULD describe a split without the bonus lines AND the fraction", () => {
  render(
    <EventSuggestionCard
      actions={actions()}
      pastSells={false}
      suggestion={makeEventSuggestion({
        averagePriceAfter: undefined,
        bonusPercent: undefined,
        bonusUnitCost: undefined,
        fractionQuantity: "0",
        quantityAfter: "50",
        quantityBefore: "12.5",
        ratioFrom: "1",
        ratioTo: "4",
        type: InvestmentOperationType.SPLIT,
      })}
    />,
  );

  expect(screen.getByText(/investment.event.ratioHeadline/)).toBeOnTheScreen();
  expect(screen.queryByText(/investment.event.bonusPercentHint/)).toBeNull();
  expect(screen.queryByText(/investment.event.unitCostLine/)).toBeNull();
  expect(screen.queryByText(/investment.event.afterFraction/)).toBeNull();
});

it("SHOULD warn WHEN the asset has sells after the record date AND disable the buttons while busy", () => {
  render(
    <EventSuggestionCard
      actions={{ ...actions(), isBusy: true }}
      pastSells
      suggestion={makeEventSuggestion()}
    />,
  );

  expect(screen.getByTestId(ids.pastHint)).toBeOnTheScreen();
  expect(hasText("investment.suggestions.eventPastSells")).toBe(true);
});
