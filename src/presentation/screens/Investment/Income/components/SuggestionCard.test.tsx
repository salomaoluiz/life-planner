import { fireEvent, screen } from "@testing-library/react-native";

import { render } from "@tests";

import { makeSuggestion } from "@screens/Investment/mocks/fixtures";
import investmentTestIds from "@screens/Investment/testIds";

import SuggestionCard from "./SuggestionCard";

const ids = investmentTestIds.suggestions;

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
  const suggestion = makeSuggestion();

  render(
    <SuggestionCard
      actions={handlers}
      suggestion={suggestion}
      today="2026-11-11"
    />,
  );
  fireEvent.press(screen.getByTestId(`${ids.approve}-sug-1`));
  fireEvent.press(screen.getByTestId(`${ids.edit}-sug-1`));
  fireEvent.press(screen.getByTestId(`${ids.reject}-sug-1`));

  expect(handlers.onApprove).toHaveBeenCalledWith(suggestion);
  expect(handlers.onEdit).toHaveBeenCalledWith(suggestion);
  expect(handlers.onReject).toHaveBeenCalledWith(suggestion);
  expect(screen.queryByTestId(ids.pastHint)).toBeNull();
});

it("SHOULD warn WHEN the payment date already passed", () => {
  render(
    <SuggestionCard
      actions={actions()}
      suggestion={makeSuggestion()}
      today="2027-01-01"
    />,
  );

  expect(screen.getByTestId(ids.pastHint)).toBeOnTheScreen();
});

it("SHOULD show the net estimate with the rate WHEN there is withholding AND a missing payment date", () => {
  render(
    <SuggestionCard
      actions={actions()}
      suggestion={makeSuggestion({
        estimatedNet: 8160,
        paymentDate: undefined,
        withholdingRate: "0.15",
      })}
      today="2027-01-01"
    />,
  );

  expect(
    screen.getByText(/investment.suggestions.estimateNet/),
  ).toBeOnTheScreen();
  expect(
    screen.getByText(/investment.suggestions.noPaymentDate/),
  ).toBeOnTheScreen();
  expect(screen.queryByTestId(ids.pastHint)).toBeNull();
});

it("SHOULD disable the buttons WHILE a decision runs", () => {
  const handlers = { ...actions(), isBusy: true };

  render(
    <SuggestionCard
      actions={handlers}
      suggestion={makeSuggestion()}
      today="2026-11-11"
    />,
  );
  fireEvent.press(screen.getByTestId(`${ids.approve}-sug-1`));

  expect(handlers.onApprove).not.toHaveBeenCalled();
});
