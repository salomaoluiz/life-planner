import { fireEvent, hasText, screen, setup, spies } from "./mocks/index.mocks";

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD render the sheet title", () => {
  setup();

  expect(hasText("family.form.title")).toBe(true);
});

it("SHOULD call onChangeName WHEN typing", () => {
  setup();

  fireEvent.changeText(screen.getByTestId("new-family-name"), "Casa");

  expect(spies.onChangeName).toHaveBeenCalledWith("Casa");
});

it("SHOULD call onSubmit WHEN the footer button is pressed", () => {
  setup();

  fireEvent.press(screen.getByTestId("new-family-submit"));

  expect(spies.onSubmit).toHaveBeenCalledTimes(1);
});

it("SHOULD show the button as busy WHEN submitting", () => {
  setup({ isSubmitting: true });

  expect(
    screen.getByTestId("new-family-submit").props.accessibilityState,
  ).toMatchObject({ busy: true });
});

it("SHOULD render the validation error in the field", () => {
  setup({ errorKey: "family.form.nameRequired" });

  expect(hasText("family.form.nameRequired")).toBe(true);
});

it("SHOULD render the counter as helper WHEN counterVisible", () => {
  setup({ counterVisible: true, name: "x".repeat(41) });

  expect(hasText(`family.form.counter {"count":41,"max":50}`)).toBe(true);
});

it("SHOULD render the generic error WHEN there is no validation error", () => {
  setup({ hasGenericError: true });

  expect(hasText("common.errors.generic")).toBe(true);
});

it("SHOULD call onClose WHEN the sheet is closed", () => {
  setup();

  fireEvent.press(screen.getAllByLabelText("common.actions.close")[0]);

  expect(spies.onClose).toHaveBeenCalledTimes(1);
});
