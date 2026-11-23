import { router } from "expo-router";

import { fireEvent, render, screen } from "@tests";

import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import { makePart, makeSplit } from "../../mocks/split.mocks";
import SplitUIModel from "../../models/SplitUIModel";
import SplitRow from "./index";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));

function setup(split = makeSplit(), expanded = false) {
  const props = {
    expanded,
    onDelete: jest.fn(),
    onEdit: jest.fn(),
    onToggle: jest.fn(),
    split,
  };

  render(<SplitRow {...props} />);

  return props;
}

it("SHOULD show the description, the chip with the part count AND the net amount while collapsed", () => {
  setup();

  expect(screen.getByText("Mercado Bom Preço")).toBeOnTheScreen();
  expect(screen.getByText(/financial.split.chip/)).toBeOnTheScreen();
  expect(screen.getByTestId(transactionsTestIds.splitAmount)).toBeOnTheScreen();
  expect(
    screen.queryByTestId(transactionsTestIds.splitPart),
  ).not.toBeOnTheScreen();
  expect(
    screen.queryByTestId(transactionsTestIds.splitOfTotal),
  ).not.toBeOnTheScreen();
});

it("SHOULD toggle on press", () => {
  const props = setup();

  fireEvent.press(screen.getByTestId(transactionsTestIds.splitToggle));

  expect(props.onToggle).toHaveBeenCalledWith("split-1");
});

it("SHOULD list every part with the adjustment label AND the actions WHEN expanded", () => {
  const props = setup(makeSplit(), true);

  expect(screen.getAllByTestId(transactionsTestIds.splitPart)).toHaveLength(3);
  expect(screen.getByText(/financial.split.adjustment/)).toBeOnTheScreen();
  expect(screen.getByText("Detergente")).toBeOnTheScreen();
  expect(screen.getByText("#casa")).toBeOnTheScreen();

  fireEvent.press(screen.getAllByTestId(transactionsTestIds.splitPart)[0]);
  fireEvent.press(screen.getByTestId(transactionsTestIds.splitEdit));
  fireEvent.press(screen.getByTestId(transactionsTestIds.splitDelete));

  expect(props.onEdit).toHaveBeenCalledTimes(2);
  expect(props.onEdit).toHaveBeenCalledWith("split-1");
  expect(props.onDelete).toHaveBeenCalledWith("split-1");
});

it("SHOULD show the matching share, 'of the total' AND the other parts line WHEN filtered", () => {
  setup(
    new SplitUIModel("split-1", [
      makePart("p2", 1, "50.00", {
        split: {
          description: "Mercado",
          matchedCount: 1,
          matchedTotal: "50.00",
          partCount: 6,
          total: "280.00",
          type: "EXPENSE",
        },
      }),
    ]),
    true,
  );

  expect(screen.getByText(/financial.split.matched/)).toBeOnTheScreen();
  expect(
    screen.getByTestId(transactionsTestIds.splitOfTotal),
  ).toBeOnTheScreen();
  expect(screen.getByTestId(transactionsTestIds.splitOthers)).toBeOnTheScreen();
});

describe("a split owned by a stock purchase (spec 120 FR 40)", () => {
  function purchaseSplit() {
    const split = {
      description: "Compra no Atacadão",
      matchedCount: 2,
      matchedTotal: "100.00",
      partCount: 2,
      stockPurchaseId: "purchase-1",
      total: "100.00",
      type: "EXPENSE" as never,
    };

    return makeSplit([
      makePart("p1", 0, "60.00", { split }),
      makePart("p2", 1, "40.00", { split }),
    ]);
  }

  it("SHOULD offer 'Ver itens da compra' AND open the purchase instead of the split editor", () => {
    const props = setup(purchaseSplit(), true);

    fireEvent.press(screen.getByTestId(transactionsTestIds.splitViewPurchase));
    fireEvent.press(screen.getAllByTestId(transactionsTestIds.splitPart)[0]);

    expect(router.push).toHaveBeenCalledWith("/stock/purchases/purchase-1");
    expect(router.push).toHaveBeenCalledTimes(2);
    expect(props.onEdit).not.toHaveBeenCalled();
  });

  it("SHOULD not show the link for an ordinary split", () => {
    setup();

    expect(
      screen.queryByTestId(transactionsTestIds.splitViewPurchase),
    ).not.toBeOnTheScreen();
  });
});
