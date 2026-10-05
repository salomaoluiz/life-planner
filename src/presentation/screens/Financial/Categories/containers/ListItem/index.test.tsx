import {
  fireEvent,
  hasText,
  mocks,
  screen,
  setup,
  spies,
} from "./mocks/index.mocks";

it("SHOULD pass its props to the list item hook", () => {
  const { item } = setup();

  expect(spies.useListItem).toHaveBeenCalledWith({
    item,
    refetch: mocks.refetch,
  });
});

it("SHOULD render the name, the owner and the expense label", () => {
  setup();

  expect(hasText("Food")).toBe(true);
  expect(hasText("Alice Test (Personal) • financial.categories.expense")).toBe(
    true,
  );
  expect(
    screen.UNSAFE_getAllByProps({ source: "food" }).length,
  ).toBeGreaterThan(0);
});

it("SHOULD render the income label WHEN the category is an income", () => {
  setup({ type: "INCOME" });

  expect(hasText("Alice Test (Personal) • financial.categories.income")).toBe(
    true,
  );
});

it("SHOULD increase the left padding as the depth level grows", () => {
  function paddingFor(depthLevel: number) {
    setup({ depthLevel });
    const container = screen.toJSON() as unknown as {
      props: { style: object };
    };
    const { paddingLeft } = Object.assign(
      {},
      ...[container.props.style].flat(Infinity),
    ) as { paddingLeft: number };
    screen.unmount();
    return paddingLeft;
  }

  expect(paddingFor(2) - paddingFor(0)).toBe(40);
});

it("SHOULD call onDelete WHEN the delete button is pressed", () => {
  setup();

  fireEvent.press(screen.getAllByLabelText("common.actions.delete")[0]);

  expect(mocks.onDelete).toHaveBeenCalledTimes(1);
});
