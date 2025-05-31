import {
  act,
  mocks,
  renderComponent,
  screen,
  setup,
  spies,
} from "./mocks/index.mocks";

it("SHOULD render correctly the icon category", () => {
  setup();

  expect(
    screen.getByTestId(`category-item-icon-${mocks.categoryFamily.id}`),
  ).toBeOnTheScreen();
});

it("SHOULD render correctly the name category", () => {
  setup();

  expect(
    screen.getByTestId(`category-item-name-${mocks.categoryFamily.id}`),
  ).toBeOnTheScreen();
});

it("SHOULD render correctly the owner type when is a Family", () => {
  setup();

  expect(screen.getByText(mocks.categoryFamily.owner)).toBeOnTheScreen();
});

it("SHOULD render correctly the owner icon type when is a Family", () => {
  setup();

  const ownerIcon = screen.getByTestId(
    `category-item-owner-icon-${mocks.categoryFamily.id}`,
  );
  expect(ownerIcon.props.source).toBe("account-group");
});

it("SHOULD render correctly the owner type when is a User", () => {
  setup({ category: mocks.categoryUser });

  expect(screen.getByText(mocks.categoryUser.owner)).toBeOnTheScreen();
});

it("SHOULD render correctly the owner icon type when is a User", () => {
  setup({ category: mocks.categoryUser });

  const ownerIcon = screen.getByTestId(
    `category-item-owner-icon-${mocks.categoryUser.id}`,
  );
  expect(ownerIcon.props.source).toBe("account");
});

it("SHOULD Menu render the MenuItems component", () => {
  setup();

  const menu = screen.getByTestId(
    `category-item-menu-${mocks.categoryFamily.id}`,
  );

  expect(menu).toBeOnTheScreen();
  expect(menu.props.children.props).toEqual({
    onDelete: mocks.useCategoryItem.onDelete,
    onEdit: mocks.useCategoryItem.onEdit,
  });
});

it("SHOULD change the visibility when the menu button is pressed and when is dismissed", () => {
  setup();

  const menu = screen.getByTestId(
    `category-item-menu-${mocks.categoryFamily.id}`,
  );

  expect(menu.props.visible).toBeFalsy();

  act(() => menu.props.anchor.props.onPress());
  screen.rerender(renderComponent());

  expect(menu.props.visible).toBeTruthy();

  act(() => menu.props.onDismiss());
  screen.rerender(renderComponent());

  expect(menu.props.visible).toBeFalsy();
});
