import { fireEvent, makeState, screen, setup } from "./mocks/index.mocks";
import { newPart } from "./models/splitFormState";
import splitFormTestIds from "./testIds";

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD show the create title, the shared fields, the parts AND the save button", () => {
  setup();

  expect(screen.getByText("financial.split.form.title")).toBeOnTheScreen();
  expect(screen.getByTestId(splitFormTestIds.description)).toBeOnTheScreen();
  expect(screen.getByTestId(splitFormTestIds.source)).toBeOnTheScreen();
  expect(screen.getByTestId(splitFormTestIds.date)).toBeOnTheScreen();
  expect(screen.getByTestId(splitFormTestIds.paid)).toBeOnTheScreen();
  expect(screen.getByTestId(splitFormTestIds.notes)).toBeOnTheScreen();
  expect(screen.getAllByTestId(splitFormTestIds.partRow)).toHaveLength(2);
  expect(screen.getByTestId(splitFormTestIds.sumTotal)).toBeOnTheScreen();
  expect(screen.getByTestId(splitFormTestIds.typeTotal)).toBeOnTheScreen();
  expect(screen.getByTestId(splitFormTestIds.addPart)).toBeOnTheScreen();
  expect(screen.queryByTestId(splitFormTestIds.banner)).toBeNull();
  expect(screen.queryByTestId(splitFormTestIds.deleteButton)).toBeNull();
});

it("SHOULD call the handlers of the buttons", () => {
  const onSave = jest.fn();
  const onAddPart = jest.fn();
  const onTotalTypePress = jest.fn();

  setup({ onAddPart, onSave, onTotalTypePress });

  fireEvent.press(screen.getByTestId(splitFormTestIds.saveButton));
  fireEvent.press(screen.getByTestId(splitFormTestIds.addPart));
  fireEvent.press(screen.getByTestId(splitFormTestIds.typeTotal));

  expect(onSave).toHaveBeenCalled();
  expect(onAddPart).toHaveBeenCalled();
  expect(onTotalTypePress).toHaveBeenCalled();
});

it("SHOULD disable save WHEN the parts do not match the typed total AND show the banner with its actions (FR 42)", () => {
  const onAdjust = jest.fn();

  setup({
    isTotalTyped: true,
    onAdjust,
    remainingCents: -440,
    state: makeState({ totalPaidCents: 16560 }),
  });

  expect(screen.getByTestId(splitFormTestIds.totalPaid)).toBeOnTheScreen();
  expect(screen.getByTestId(splitFormTestIds.banner)).toBeOnTheScreen();
  expect(screen.getByTestId(splitFormTestIds.bannerPart)).toBeOnTheScreen();
  expect(screen.getByTestId(splitFormTestIds.saveButton)).toBeDisabled();

  fireEvent.press(screen.getByTestId(`${splitFormTestIds.banner}-action`));

  expect(onAdjust).toHaveBeenCalled();
});

it("SHOULD show the adjustment part with discount/extra instead of category AND type", () => {
  setup({
    state: makeState({
      parts: [
        newPart("EXPENSE", { categoryId: "cat-1", cents: 12000 }),
        newPart("EXPENSE", { adjustment: true, cents: -440 }),
      ],
    }),
  });

  expect(
    screen.getAllByTestId(`${splitFormTestIds.partCategory}-field`),
  ).toHaveLength(1);
  expect(
    screen.getByTestId(splitFormTestIds.partAdjustmentKind),
  ).toBeOnTheScreen();
  expect(screen.getAllByTestId(splitFormTestIds.partType)).toHaveLength(1);
});

it("SHOULD hide the type toggle AND paid on a card, explaining expenses only", () => {
  setup({ isCard: true });

  expect(screen.queryByTestId(splitFormTestIds.partType)).toBeNull();
  expect(screen.queryByTestId(splitFormTestIds.paid)).toBeNull();
  expect(screen.getByText("financial.split.cardExpenseOnly")).toBeOnTheScreen();
});

it("SHOULD show the edit title, undo AND delete WHEN editing a split with several parts", () => {
  const onUndoPress = jest.fn();
  const onDeletePress = jest.fn();

  setup({ canUndo: true, isEditing: true, onDeletePress, onUndoPress });

  expect(screen.getByText("financial.split.form.editTitle")).toBeOnTheScreen();

  fireEvent.press(screen.getByTestId(splitFormTestIds.undoButton));
  fireEvent.press(screen.getByTestId(splitFormTestIds.deleteButton));

  expect(onUndoPress).toHaveBeenCalled();
  expect(onDeletePress).toHaveBeenCalled();
});

it("SHOULD render nothing of the body WHILE loading AND show the form error", () => {
  setup({ isLoading: true });
  expect(screen.queryByTestId(splitFormTestIds.description)).toBeNull();
});

it("SHOULD show the error message of a failed save", () => {
  setup({ errorKey: "financial.errors.splitTotalMismatch" });

  expect(screen.getByTestId(splitFormTestIds.formError)).toBeOnTheScreen();
});

it("SHOULD forward the part handlers", () => {
  const onPartRemove = jest.fn();

  setup({ onPartRemove });

  fireEvent.press(screen.getAllByTestId(splitFormTestIds.partRemove)[0]);

  expect(onPartRemove).toHaveBeenCalledTimes(1);
});
