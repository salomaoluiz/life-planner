import { fireEvent, screen } from "@testing-library/react-native";

import { hasText } from "@tests";

import investmentTestIds from "@screens/Investment/testIds";

import { setup } from "./mocks/index.mocks";

const ids = investmentTestIds.modal.valuation;

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD render the two fields AND save", () => {
  const { vm } = setup();

  fireEvent.changeText(screen.getByTestId(ids.unitPrice), "10,61");
  fireEvent.press(screen.getByTestId(ids.save));

  expect(hasText("investment.form.valuation.title")).toBe(true);
  expect(hasText("investment.form.valuation.hint")).toBe(true);
  expect(vm.onUnitPriceChange).toHaveBeenCalledWith("10,61");
  expect(vm.onSave).toHaveBeenCalledTimes(1);
});

it("SHOULD show the position line, the field error AND the failure", () => {
  setup({
    failure: { key: "investment.errors.archived" },
    positionText: { price: "$10", quantity: "1", value: "$10" },
    unitPriceError: "investment.form.operation.unitPriceInvalid",
  });

  expect(screen.getByTestId(ids.position)).toBeOnTheScreen();
  expect(hasText("investment.form.operation.unitPriceInvalid")).toBe(true);
  expect(hasText("investment.errors.archived")).toBe(true);
});

it("SHOULD render the loading AND the not found states", () => {
  setup({ isLoading: true });
  expect(screen.queryByTestId(ids.unitPrice)).toBeNull();

  const { vm } = setup({ isNotFound: true });
  fireEvent.press(screen.getAllByText("investment.form.close")[0]);
  expect(vm.onClose).toBeDefined();
});
