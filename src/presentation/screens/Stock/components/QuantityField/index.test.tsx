import { fireEvent, render, screen } from "@tests";

import { StockUnits } from "@domain/entities/stock/StockEntity";
import { QuantityMode } from "@domain/entities/stock/stockQuantity";

import QuantityField from "./index";

function setup(
  props: Partial<React.ComponentProps<typeof QuantityField>> = {},
) {
  const onChange = jest.fn();

  render(
    <QuantityField
      input={{ mode: QuantityMode.SMALL, text: "" }}
      label="Quantity"
      onChange={onChange}
      testID="qty"
      unit={StockUnits.KILOGRAM}
      {...props}
    />,
  );

  return { onChange };
}

it.each([
  [StockUnits.UNIT, QuantityMode.SMALL, "Quantity (common.units.unit)"],
  [StockUnits.KILOGRAM, QuantityMode.SMALL, "Quantity (common.units.gram)"],
  [StockUnits.KILOGRAM, QuantityMode.LARGE, "Quantity (common.units.kilogram)"],
  [StockUnits.LITER, QuantityMode.SMALL, "Quantity (common.units.milliliter)"],
  [StockUnits.LITER, QuantityMode.LARGE, "Quantity (common.units.liter)"],
])("SHOULD label a %s field in %s mode as '%s'", (unit, mode, label) => {
  setup({ input: { mode, text: "1" }, unit });

  expect(screen.getByLabelText(label)).toBeOnTheScreen();
});

it("SHOULD switch g to kg while typing (1500 g -> 1,5 kg) and report the new input", () => {
  const { onChange } = setup();

  fireEvent.changeText(screen.getByTestId("qty"), "1500");

  expect(onChange).toHaveBeenCalledWith({
    mode: QuantityMode.LARGE,
    text: "1,5",
  });
});

it("SHOULD refuse a decimal on a UNIT item AND show the error and the helper", () => {
  const { onChange } = setup({
    error: "Bad",
    helper: "Hint",
    unit: StockUnits.UNIT,
  });

  fireEvent.changeText(screen.getByTestId("qty"), "1,5");

  expect(onChange).toHaveBeenCalledWith({ mode: QuantityMode.SMALL, text: "" });
  expect(screen.getByText("Bad")).toBeOnTheScreen();
});
