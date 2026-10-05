import {
  fireEvent,
  hasText,
  mocks,
  screen,
  setup,
  spies,
} from "./mocks/index.mocks";

function pickers() {
  const [owner, status] = screen.UNSAFE_getAllByType(mocks.Picker);
  return { owner, status };
}

function press(label: string) {
  fireEvent.press(screen.UNSAFE_getAllByProps({ label })[0]);
}

const editParams = {
  balance: "50",
  icon: "cash",
  id: "acc-1",
  name: "Savings",
  ownerId: "owner-2",
  status: "ARCHIVED",
};

describe("loading", () => {
  it.each([
    ["owners are fetching", { isFetching: true }],
    ["owners are not loaded", { noOwners: true }],
  ])("SHOULD render only the loading state WHEN %s", (_, props) => {
    setup(props);

    expect(hasText("financial.accounts.loading")).toBe(true);
    expect(hasText("financial.accounts.addNewAccount")).toBe(false);
  });
});

describe("create mode", () => {
  it("SHOULD render the add title and button", () => {
    setup();

    expect(hasText("financial.accounts.addNewAccount")).toBe(true);
    expect(
      screen.UNSAFE_getAllByProps({ label: "financial.accounts.add" }).length,
    ).toBeGreaterThan(0);
  });

  it("SHOULD configure the mutation with the create use case name", () => {
    setup();

    expect(spies.useMutation.mock.calls[0][0].cacheKey).toEqual([
      "create_account",
    ]);
  });

  it("SHOULD create the account WHEN the mutation fetch runs", async () => {
    setup();
    const payload = { name: "Checking" };

    await spies.useMutation.mock.calls[0][0].fetch(payload as never);

    expect(spies.createAccount).toHaveBeenCalledWith(payload);
    expect(spies.updateAccount).not.toHaveBeenCalled();
  });

  it("SHOULD start the form without initial values", () => {
    setup();

    expect(spies.useForm).toHaveBeenCalledWith({
      initialValues: {
        balance: undefined,
        icon: undefined,
        id: undefined,
        name: undefined,
        ownerId: undefined,
        status: undefined,
      },
    });
  });
});

describe("edit mode", () => {
  it("SHOULD render the edit title and the save button", () => {
    setup({ params: editParams });

    expect(hasText("financial.accounts.editAccount")).toBe(true);
    expect(
      screen.UNSAFE_getAllByProps({ label: "financial.accounts.save" }).length,
    ).toBeGreaterThan(0);
  });

  it("SHOULD configure the mutation with the update use case name", () => {
    setup({ params: editParams });

    expect(spies.useMutation.mock.calls[0][0].cacheKey).toEqual([
      "update_account",
    ]);
  });

  it("SHOULD update the account WHEN the mutation fetch runs", async () => {
    setup({ params: editParams });
    const payload = { id: "acc-1", name: "Savings" };

    await spies.useMutation.mock.calls[0][0].fetch(payload as never);

    expect(spies.updateAccount).toHaveBeenCalledWith(payload);
    expect(spies.createAccount).not.toHaveBeenCalled();
  });

  it("SHOULD start the form with the route params", () => {
    setup({ params: editParams });

    expect(spies.useForm).toHaveBeenCalledWith({ initialValues: editParams });
  });
});

describe("form", () => {
  it("SHOULD show an error message for each field with an error", () => {
    setup({
      errors: { balance: "Balance is required", name: "Name is required" },
    });

    expect(hasText("Name is required")).toBe(true);
    expect(hasText("Balance is required")).toBe(true);
  });

  it("SHOULD NOT show error messages WHEN there are no errors", () => {
    setup();

    expect(screen.UNSAFE_queryAllByProps({ visible: true })).toHaveLength(0);
  });

  it("SHOULD forward text input changes", () => {
    const { fields } = setup();

    fireEvent.changeText(
      screen.UNSAFE_getAllByProps({ label: "financial.accounts.name" })[0],
      "Checking",
    );
    fireEvent.changeText(
      screen.UNSAFE_getAllByProps({ label: "financial.accounts.balance" })[0],
      "10",
    );

    expect(fields.name.onChange).toHaveBeenCalledWith("Checking");
    expect(fields.balance.onChange).toHaveBeenCalledWith("10");
  });

  it("SHOULD list the owners and statuses in the pickers", () => {
    setup();
    const { owner, status } = pickers();

    expect(owner.props.items).toEqual([
      { label: "Personal - Alice Test", value: "owner-1" },
      { label: "Family - Test Family", value: "owner-2" },
    ]);
    expect(status.props.items.map((i: { value: string }) => i.value)).toEqual([
      "ACTIVE",
      "ARCHIVED",
    ]);
  });

  it("SHOULD preselect the first owner WHEN none is selected", () => {
    setup();

    expect(pickers().owner.props.selectedValue).toBe("owner-1");
  });

  it("SHOULD preselect the chosen owner WHEN one is selected", () => {
    setup({ fieldValues: { ownerId: "owner-2" } });

    expect(pickers().owner.props.selectedValue).toBe("owner-2");
  });

  it.each(["owner-1", "owner-2"])(
    "SHOULD forward the selection of owner %s",
    (id) => {
      const { fields } = setup();

      pickers().owner.props.onValueChange(id);

      expect(fields.ownerId.onChange).toHaveBeenCalledWith(id);
    },
  );

  it("SHOULD forward the status selection", () => {
    const { fields } = setup();

    pickers().status.props.onValueChange("ARCHIVED");

    expect(fields.status.onChange).toHaveBeenCalledWith("ARCHIVED");
  });

  it("SHOULD render all the icons and forward the chosen icon", () => {
    const { fields } = setup();

    expect(screen.getAllByLabelText("wallet").length).toBeGreaterThan(0);

    fireEvent.press(screen.getAllByLabelText("wallet")[0]);

    expect(fields.icon.onChange).toHaveBeenCalledWith("wallet");
  });

  it("SHOULD highlight only the selected icon", () => {
    setup({ fieldValues: { icon: "cash" } });
    const selected = screen.UNSAFE_getAllByProps({ source: "cash" })[0];
    const other = screen.UNSAFE_getAllByProps({ source: "bank" })[0];

    expect(selected.props.color).not.toBe(other.props.color);
  });
});

describe("actions", () => {
  it("SHOULD go back WHEN Cancel is pressed", () => {
    setup();

    press("financial.accounts.cancel");

    expect(spies.back).toHaveBeenCalledTimes(1);
  });

  it("SHOULD go back WHEN the backdrop is pressed", () => {
    setup();

    fireEvent.press(screen.UNSAFE_getAllByType(mocks.Pressable)[0]);

    expect(spies.back).toHaveBeenCalledTimes(1);
  });

  it("SHOULD NOT save WHEN the form is invalid", () => {
    const { mutate } = setup();
    mocks.validateForm.mockReturnValueOnce(undefined);

    press("financial.accounts.add");

    expect(mocks.validateForm).toHaveBeenCalledWith(mocks.owners);
    expect(mutate).not.toHaveBeenCalled();
  });

  it("SHOULD save the validated values WHEN the form is valid", () => {
    const { mutate } = setup();
    const validated = { name: "Checking", owner: "USER", ownerId: "owner-1" };
    mocks.validateForm.mockReturnValueOnce(validated);

    press("financial.accounts.add");

    expect(mutate).toHaveBeenCalledWith(validated);
  });

  it("SHOULD go back WHEN the account was saved", () => {
    setup({ status: "success" });

    expect(spies.back).toHaveBeenCalledTimes(1);
  });

  it("SHOULD NOT go back on mount WHEN the mutation is idle", () => {
    setup();

    expect(spies.back).not.toHaveBeenCalled();
  });
});
