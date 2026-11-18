import { fireEvent, render, screen } from "@tests";

import { StockUnits } from "@domain/entities/stock/StockEntity";
import { quickMock } from "@screens/Stock/mocks/index.mocks";
import StockItemUIModel from "@screens/Stock/models/StockItemUIModel";
import { dto, owners } from "@screens/Stock/models/stockUi.fixtures";
import stockTestIds from "@screens/Stock/testIds";

import StockQuickStepper from "./index";

function setup(
  build: Parameters<typeof dto>[0],
  quick: ReturnType<typeof quickMock> = quickMock(),
) {
  const item = new StockItemUIModel(dto(build), owners, "en-US");

  render(<StockQuickStepper item={item} quick={quick as never} />);

  return quick;
}

it("SHOULD step with the item step on − and + AND open the exact sheet on long press", () => {
  const quick = setup((f) =>
    f
      .withId("rice")
      .withUnit(StockUnits.KILOGRAM)
      .withQuantity(2)
      .withQuickStep(0.5),
  );

  fireEvent.press(screen.getByTestId(stockTestIds.rowDecrement));
  fireEvent.press(screen.getByTestId(stockTestIds.rowIncrement));
  fireEvent(screen.getByTestId(stockTestIds.rowDecrement), "longPress");

  expect(quick.onStep).toHaveBeenNthCalledWith(1, expect.anything(), -1, 0.5);
  expect(quick.onStep).toHaveBeenNthCalledWith(2, expect.anything(), 1, 0.5);
  expect(quick.onExactOpen).toHaveBeenCalledWith(expect.anything(), -1);
});

it("SHOULD disable − WHEN the quantity is 0", () => {
  setup((f) => f.withQuantity(0));

  expect(
    screen.getByTestId(stockTestIds.rowDecrement).props.accessibilityState
      .disabled,
  ).toBe(true);
});

it("SHOULD show Abri only with a shelf life, no open lot and stock, AND open on tap", () => {
  const quick = setup((f) => f.withQuantity(2).withOpenedShelfLifeDays(5));

  fireEvent.press(screen.getByTestId(stockTestIds.rowOpen));

  expect(quick.onOpen).toHaveBeenCalled();
});

it("SHOULD hide Abri WHEN the item has no shelf life", () => {
  setup((f) => f.withQuantity(2));

  expect(screen.queryByTestId(stockTestIds.rowOpen)).toBeNull();
});

it("SHOULD hide Abri WHEN a lot is already open", () => {
  setup((f) => f.withOpenedShelfLifeDays(5).withHasOpenLot());

  expect(screen.queryByTestId(stockTestIds.rowOpen)).toBeNull();
});

it("SHOULD show only the quantity WHEN the family is archived", () => {
  setup((f) => f.withOwnerId("family-2").withQuantity(3));

  expect(screen.queryByTestId(stockTestIds.rowDecrement)).toBeNull();
  expect(screen.queryByTestId(stockTestIds.rowIncrement)).toBeNull();
  expect(screen.getByTestId(stockTestIds.rowQuantity)).toBeTruthy();
});

it("SHOULD mark the row as pending WHEN its movement is queued", () => {
  setup(
    (f) => f.withId("milk"),
    quickMock({ isPending: jest.fn().mockReturnValue(true) }),
  );

  expect(screen.getByTestId(stockTestIds.rowPending)).toBeTruthy();
});
