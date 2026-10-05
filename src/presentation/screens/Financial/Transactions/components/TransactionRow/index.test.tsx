import { fireEvent, screen } from "@tests";

import { AmountText } from "@components";

import { setup } from "./mocks/index.mocks";

it("SHOULD render description, subtitle and the signed amount", () => {
  const { item } = setup();

  expect(screen.getByText("Groceries")).toBeOnTheScreen();
  expect(screen.getByText(item.subtitle)).toBeOnTheScreen();
  const amount = screen.UNSAFE_getByType(AmountText);
  expect(amount.props.value).toBe(1250);
  expect(amount.props.type).toBe("EXPENSE");
});

it("SHOULD call onPress with the id WHEN pressed", () => {
  const { onPress } = setup();

  fireEvent.press(screen.getByTestId("transaction-row-tx-1"));

  expect(onPress).toHaveBeenCalledWith("tx-1");
});
