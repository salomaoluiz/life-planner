import {
  act,
  fireEvent,
  hasText,
  mocks,
  screen,
  setup,
  spies,
} from "./mocks/index.mocks";

function menus() {
  const [color, icon] = screen.UNSAFE_getAllByType(mocks.Menu);
  return { color, icon };
}

function pickers() {
  const [type, owner, parent] = screen.UNSAFE_getAllByType(mocks.Picker);
  return { owner, parent, type };
}

function press(label: string) {
  fireEvent.press(screen.UNSAFE_getAllByProps({ label })[0]);
}

describe("loading", () => {
  it.each([
    ["owners are fetching", { fetching: "owners" as const }],
    ["categories are fetching", { fetching: "categories" as const }],
    ["owners are not loaded", { owners: undefined }],
    ["categories are not loaded", { categories: undefined }],
  ])("SHOULD render only the loading state WHEN %s", (_, props) => {
    setup(props);

    expect(hasText("Loading...")).toBe(true);
    expect(hasText("financial.categories.addNewCategory")).toBe(false);
  });
});

describe("data fetching", () => {
  it("SHOULD fetch the categories of every owner", async () => {
    setup();
    const call = spies.useQuery.mock.calls.find(
      ([options]) => options.cacheKey[0] === "get_categories",
    )!;
    spies.getCategories.mockResolvedValue(mocks.categories);

    const result = await call[0].fetch();

    expect(call[0].enabled).toBe(true);
    expect(spies.getCategories).toHaveBeenCalledWith(["owner-1", "owner-2"]);
    expect(result).toBe(mocks.categories);
  });

  it("SHOULD be disabled and return no categories WHEN the owners are not loaded", async () => {
    setup({ owners: undefined });
    const call = spies.useQuery.mock.calls.find(
      ([options]) => options.cacheKey[0] === "get_categories",
    )!;

    const result = await call[0].fetch();

    expect(call[0].enabled).toBe(false);
    expect(result).toEqual([]);
    expect(spies.getCategories).not.toHaveBeenCalled();
  });
});

describe("form", () => {
  it("SHOULD render the title and the actions", () => {
    setup();

    expect(hasText("financial.categories.addNewCategory")).toBe(true);
    expect(
      screen.UNSAFE_getAllByProps({ label: "financial.categories.add" }).length,
    ).toBeGreaterThan(0);
  });

  it("SHOULD show the name error", () => {
    setup({ errors: { name: "Name is required" } });

    expect(hasText("Name is required")).toBe(true);
  });

  it("SHOULD NOT show an error WHEN there are none", () => {
    setup();

    expect(screen.UNSAFE_queryAllByProps({ visible: true })).toHaveLength(0);
  });

  it("SHOULD forward the name input", () => {
    const { fields } = setup();

    fireEvent.changeText(
      screen.UNSAFE_getAllByProps({ label: "financial.categories.name" })[0],
      "Bonus",
    );

    expect(fields.name.onChange).toHaveBeenCalledWith("Bonus");
  });

  it("SHOULD set the type and reset the parent WHEN the type changes", () => {
    const { fields } = setup();

    pickers().type.props.onValueChange("INCOME");

    expect(fields.type.onChange).toHaveBeenCalledWith("INCOME");
    expect(fields.parentId.onChange).toHaveBeenCalledWith("");
  });

  it("SHOULD list the owners and preselect the first one", () => {
    setup();
    const { owner } = pickers();

    expect(owner.props.items).toEqual([
      { label: "USER - Alice Test", value: "owner-1" },
      { label: "FAMILY - Test Family", value: "owner-2" },
    ]);
    expect(owner.props.selectedValue).toBe("owner-1");
  });

  it("SHOULD preselect the chosen owner", () => {
    setup({ fieldValues: { ownerId: "owner-2" } });

    expect(pickers().owner.props.selectedValue).toBe("owner-2");
  });

  it.each(["owner-1", "owner-2"])(
    "SHOULD set the owner %s and reset the parent WHEN it is selected",
    (id) => {
      const { fields } = setup();

      pickers().owner.props.onValueChange(id);

      expect(fields.ownerId.onChange).toHaveBeenCalledWith(id);
      expect(fields.parentId.onChange).toHaveBeenCalledWith("");
    },
  );

  it("SHOULD offer the root option and the parents of the chosen owner and type", () => {
    setup();

    expect(pickers().parent.props.items).toEqual([
      { label: "None (Root Category)", value: "" },
      { label: "Food", value: "cat-1" },
    ]);
  });

  it("SHOULD offer the parents of the selected owner and type", () => {
    setup({ fieldValues: { ownerId: "owner-2" } });

    expect(pickers().parent.props.items).toEqual([
      { label: "None (Root Category)", value: "" },
      { label: "Rent", value: "cat-3" },
    ]);
  });

  it("SHOULD select the root option WHEN no parent is chosen and forward parent changes", () => {
    const { fields } = setup();

    expect(pickers().parent.props.selectedValue).toBe("");

    pickers().parent.props.onValueChange("cat-1");

    expect(fields.parentId.onChange).toHaveBeenCalledWith("cat-1");
  });

  it("SHOULD select the chosen parent", () => {
    setup({ fieldValues: { parentId: "cat-1" } });

    expect(pickers().parent.props.selectedValue).toBe("cat-1");
  });
});

describe("color selector", () => {
  it("SHOULD show the rainbow preview WHEN the color is black", () => {
    setup();

    expect(screen.UNSAFE_queryAllByType(mocks.Svg).length).toBeGreaterThan(0);
  });

  it("SHOULD show a solid preview WHEN a color was chosen", () => {
    setup({ fieldValues: { iconColor: "#007bff" } });

    expect(screen.UNSAFE_queryAllByType(mocks.Svg)).toHaveLength(0);
  });

  it("SHOULD open and dismiss the color menu", () => {
    setup();

    expect(menus().color.props.visible).toBe(false);
    act(() => menus().color.props.anchor.props.onPress());
    expect(menus().color.props.visible).toBe(true);

    act(() => menus().color.props.onDismiss());
    expect(menus().color.props.visible).toBe(false);
  });

  it("SHOULD choose a color and close the menu", () => {
    const { fields } = setup();
    act(() => menus().color.props.anchor.props.onPress());

    const options = menus().color.props.children.props.children;
    act(() => options[1].props.onPress());

    expect(fields.iconColor.onChange).toHaveBeenCalledWith("#8a2be2");
    expect(menus().color.props.visible).toBe(false);
  });

  it("SHOULD mark only the selected color with a check", () => {
    setup({ fieldValues: { iconColor: "#4cd137" } });

    expect(screen.UNSAFE_getAllByProps({ name: "check" })).toHaveLength(1);
  });
});

describe("icon selector", () => {
  it("SHOULD show the current icon with the chosen color", () => {
    setup({ fieldValues: { icon: "cash", iconColor: "#ff4d4d" } });

    const preview = screen.UNSAFE_getAllByProps({ source: "cash" })[0];
    expect(preview.props.color).toBe("#ff4d4d");
  });

  it("SHOULD open and dismiss the icon menu", () => {
    setup();

    expect(menus().icon.props.visible).toBe(false);
    act(() => menus().icon.props.anchor.props.onPress());
    expect(menus().icon.props.visible).toBe(true);

    act(() => menus().icon.props.onDismiss());
    expect(menus().icon.props.visible).toBe(false);
  });

  it("SHOULD choose an icon and close the menu", () => {
    const { fields } = setup();
    act(() => menus().icon.props.anchor.props.onPress());

    fireEvent.press(screen.getAllByLabelText("wifi")[0]);

    expect(fields.icon.onChange).toHaveBeenCalledWith("wifi");
    expect(menus().icon.props.visible).toBe(false);
  });

  it("SHOULD highlight only the selected icon", () => {
    setup({ fieldValues: { icon: "car" } });
    const selected = screen.UNSAFE_getAllByProps({ source: "car" })[0];
    const other = screen.UNSAFE_getAllByProps({ source: "home" })[0];

    expect(selected.props.color).not.toBe(other.props.color);
  });
});

describe("actions", () => {
  it("SHOULD go back WHEN Cancel is pressed", () => {
    setup();

    press("financial.categories.cancel");

    expect(spies.back).toHaveBeenCalledTimes(1);
  });

  it("SHOULD go back WHEN the backdrop is pressed", () => {
    setup();

    fireEvent.press(screen.UNSAFE_getAllByType(mocks.Pressable)[0]);

    expect(spies.back).toHaveBeenCalledTimes(1);
  });

  it("SHOULD NOT create the category WHEN the form is invalid", () => {
    const { mutate } = setup();
    mocks.validateForm.mockReturnValueOnce(undefined);

    press("financial.categories.add");

    expect(mocks.validateForm).toHaveBeenCalledWith(
      mocks.owners,
      mocks.categories,
    );
    expect(mutate).not.toHaveBeenCalled();
  });

  it("SHOULD create the category with the validated params WHEN the form is valid", () => {
    const { mutate } = setup();
    const params = { name: "Bonus" };
    mocks.validateForm.mockReturnValueOnce(params);

    press("financial.categories.add");

    expect(mutate).toHaveBeenCalledWith(params);
  });

  it("SHOULD go back WHEN the category was created", () => {
    setup({ status: "success" });

    expect(spies.back).toHaveBeenCalledTimes(1);
  });

  it("SHOULD NOT go back on mount WHEN the mutation is idle", () => {
    setup();

    expect(spies.back).not.toHaveBeenCalled();
  });
});
