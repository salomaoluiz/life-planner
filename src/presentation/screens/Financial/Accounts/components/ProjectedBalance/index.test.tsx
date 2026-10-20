import { render, screen } from "@tests";

import ProjectedBalance from "./index";

it("SHOULD render the translated end-of-month line with the formatted amount", () => {
  render(<ProjectedBalance cents={98075} currency="BRL" testID="projected" />);

  expect(screen.getByTestId("projected")).toBeOnTheScreen();
  // The i18n mock prints the key and its params.
  expect(
    screen.getByText(/financial\.accounts\.projectedBalance.*980[.,]75/),
  ).toBeOnTheScreen();
});

it("SHOULD format a negative end-of-month balance", () => {
  render(<ProjectedBalance cents={-1500} currency="BRL" testID="projected" />);

  expect(
    screen.getByText(/financial\.accounts\.projectedBalance.*15[.,]00/),
  ).toBeOnTheScreen();
});
