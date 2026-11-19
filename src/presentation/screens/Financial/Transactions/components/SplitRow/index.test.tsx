import { fireEvent, render, screen } from "@tests";

import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import { makePart, makeSplit } from "../../mocks/split.mocks";
import SplitUIModel from "../../models/SplitUIModel";
import SplitRow from "./index";

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
