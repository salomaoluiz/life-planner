import {
  fireEvent,
  hasText,
  mocks,
  press,
  screen,
  setup,
  spies,
} from "./mocks/index.mocks";

it("SHOULD render the title and actions", () => {
  setup();

  expect(hasText("Add the family name")).toBe(true);
  expect(
    screen.UNSAFE_getAllByProps({ label: "Create" }).length,
  ).toBeGreaterThan(0);
  expect(
    screen.UNSAFE_getAllByProps({ label: "Cancel" }).length,
  ).toBeGreaterThan(0);
});

it("SHOULD configure the create mutation with the use case", () => {
  setup();

  expect(spies.useMutation).toHaveBeenCalledWith({
    cacheKey: ["create_family"],
    fetch: mocks.useCases.createFamilyUseCase.execute,
  });
});

it("SHOULD create the family with the typed name WHEN Create is pressed", () => {
  const { mutate } = setup();

  fireEvent.changeText(
    screen.UNSAFE_getAllByProps({ value: "" })[0],
    "Test Family",
  );
  press("Create");

  expect(mutate).toHaveBeenCalledWith({ name: "Test Family" });
});

it("SHOULD create the family with an empty name WHEN nothing was typed", () => {
  // Pins current behavior: there is no client-side validation.
  const { mutate } = setup();

  press("Create");

  expect(mutate).toHaveBeenCalledWith({ name: "" });
});

it("SHOULD go back WHEN Cancel is pressed", () => {
  setup();

  press("Cancel");

  expect(spies.back).toHaveBeenCalledTimes(1);
});

it("SHOULD go back WHEN the backdrop is pressed", () => {
  setup();

  fireEvent.press(screen.UNSAFE_getAllByType(mocks.Pressable)[0]);

  expect(spies.back).toHaveBeenCalledTimes(1);
});

it("SHOULD go back WHEN the family was created", () => {
  setup("success");

  expect(spies.back).toHaveBeenCalledTimes(1);
});

it("SHOULD NOT go back on mount WHEN the mutation is idle", () => {
  setup();

  expect(spies.back).not.toHaveBeenCalled();
});
