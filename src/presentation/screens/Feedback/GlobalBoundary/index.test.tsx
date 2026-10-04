import {
  act,
  fireEvent,
  mocks,
  screen,
  setup,
  spies,
} from "./mocks/index.mocks";

it("SHOULD render the component", () => {
  setup();

  expect(screen.getByTestId("globalBoundary_title")).toBeOnTheScreen();
  expect(screen.getByTestId("globalBoundary_description")).toBeOnTheScreen();
  expect(screen.getByTestId("globalBoundary_button")).toBeOnTheScreen();
});

it("SHOULD call retry function when button is pressed", () => {
  setup();

  const button = screen.getByTestId("globalBoundary_button");

  act(() => {
    fireEvent.press(button);
  });
  expect(spies.retry).toHaveBeenCalledTimes(1);
});

it("SHOULD call getString function when component is mounted", () => {
  setup();

  expect(spies.getString).toHaveBeenCalledTimes(1);
  expect(spies.getString).toHaveBeenCalledWith(mocks.fallbackKey);
});

it("SHOULD render the default language texts WHEN no language was stored", () => {
  setup();

  expect(screen.getByTestId("globalBoundary_title").props.children).toBe(
    mocks.translations["en-US"].translation.errors.generic.title,
  );
});

it("SHOULD render the stored fallback language texts WHEN one was stored", async () => {
  spies.getString.mockResolvedValueOnce("pt-BR" as never);

  setup();
  await act(async () => undefined);

  expect(screen.getByTestId("globalBoundary_title").props.children).toBe(
    mocks.translations["pt-BR"].translation.errors.generic.title,
  );
  expect(
    screen.getByText(
      mocks.translations["pt-BR"].translation.errors.generic.button.label,
    ),
  ).toBeOnTheScreen();
});
