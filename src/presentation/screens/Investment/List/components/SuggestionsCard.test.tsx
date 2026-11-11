import { fireEvent, screen } from "@testing-library/react-native";

import { render } from "@tests";

import investmentTestIds from "@screens/Investment/testIds";

import SuggestionsCard from "./SuggestionsCard";

it("SHOULD show the count AND open the inbox", () => {
  const onPress = jest.fn();

  render(<SuggestionsCard count={3} onPress={onPress} />);
  fireEvent.press(screen.getByText("investment.suggestions.title"));

  expect(
    screen.getByTestId(investmentTestIds.list.suggestionsCard),
  ).toBeOnTheScreen();
  expect(screen.getByText("3")).toBeOnTheScreen();
  expect(onPress).toHaveBeenCalled();
});

it("SHOULD hide the count badge WHEN there is nothing to decide", () => {
  render(<SuggestionsCard count={0} onPress={jest.fn()} />);

  expect(screen.queryByText("0")).toBeNull();
});
