import { StyleSheet } from "react-native";

import { useTheme } from "@presentation/theme";

import {
  fireEvent,
  hasText,
  mocks,
  screen,
  setup,
  spies,
} from "./mocks/index.mocks";

it("SHOULD render description, quantity, owner and status", () => {
  setup();

  expect(hasText("Rice")).toBe(true);
  expect(hasText("Quantity: 2 kilogram")).toBe(true);
  expect(hasText("Owner: Alice Test (Personal)")).toBe(true);
  expect(hasText("Status: In stock")).toBe(true);
});

it("SHOULD configure the delete mutation with the use case", () => {
  setup();

  expect(spies.useMutation).toHaveBeenCalledWith({
    cacheKey: ["delete_stock"],
    fetch: mocks.useCases.deleteStockItemUseCase.execute,
  });
});

it("SHOULD call mutate with item and owner ids WHEN delete is pressed", () => {
  const { mutate } = setup();

  fireEvent.press(screen.getAllByLabelText("common.actions.delete")[0]);

  expect(mutate).toHaveBeenCalledWith({ id: "stock-1", ownerId: "owner-1" });
});

it("SHOULD call refetch WHEN the delete mutation succeeds", () => {
  setup({ status: "success" });

  expect(mocks.refetch).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT call refetch WHEN the delete mutation is not successful", () => {
  setup({ status: "error" });

  expect(mocks.refetch).not.toHaveBeenCalled();
});

function getStatusColor() {
  const label = screen.UNSAFE_getAllByProps({
    children: "Status: In stock",
  })[0];
  return StyleSheet.flatten(label.props.style).color;
}

it("SHOULD use the error color on the status WHEN the item is expired", () => {
  setup({ isExpired: true });
  const expiredColor = getStatusColor();
  screen.unmount();

  setup({ isExpired: false });

  expect(expiredColor).toBe(useTheme().theme.colors.expense);
  expect(getStatusColor()).not.toBe(expiredColor);
});
