import { act, screen } from "@tests";

import { defaultFabProps, defaultFabGroupProps, setupFab, setupFabGroup } from "./mocks";

describe("Fab", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SHOULD render the fab with the correct props", () => {
    setupFab();

    const component = screen.getByTestId(defaultFabProps.testID!);

    expect(component.props).toEqual({
      icon: defaultFabProps.icon,
      label: undefined,
      onPress: expect.any(Function),
      testID: defaultFabProps.testID,
    });
  });

  it("SHOULD call onPress when fab is pressed", () => {
    setupFab();

    const component = screen.getByTestId(defaultFabProps.testID!);

    act(() => {
      component.props.onPress();
    });

    expect(defaultFabProps.onPress).toHaveBeenCalledTimes(1);
  });

  it("SHOULD render fab with label", () => {
    const label = "Add Item";
    setupFab({ label });

    const component = screen.getByTestId(defaultFabProps.testID!);

    expect(component.props.label).toBe(label);
  });

  it("SHOULD render fab with custom icon", () => {
    const customIcon = "star";
    setupFab({ icon: customIcon });

    const component = screen.getByTestId(defaultFabProps.testID!);

    expect(component.props.icon).toBe(customIcon);
  });
});

describe("FabGroup", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SHOULD render the fab group with the correct props", () => {
    setupFabGroup();

    const component = screen.getByTestId(defaultFabGroupProps.testID!);

    expect(component.props).toEqual({
      actions: defaultFabGroupProps.actions,
      icon: defaultFabGroupProps.icon,
      onStateChange: expect.any(Function),
      open: defaultFabGroupProps.isOpen,
      visible: true,
      testID: defaultFabGroupProps.testID,
    });
  });

  it("SHOULD call onStateChange when state changes", () => {
    setupFabGroup();

    const component = screen.getByTestId(defaultFabGroupProps.testID!);

    act(() => {
      component.props.onStateChange({ open: true });
    });

    expect(defaultFabGroupProps.onStateChange).toHaveBeenCalledWith({ open: true });
    expect(defaultFabGroupProps.onStateChange).toHaveBeenCalledTimes(1);
  });

  it("SHOULD render with open state", () => {
    setupFabGroup({ isOpen: true });

    const component = screen.getByTestId(defaultFabGroupProps.testID!);

    expect(component.props.open).toBe(true);
  });

  it("SHOULD render with closed state", () => {
    setupFabGroup({ isOpen: false });

    const component = screen.getByTestId(defaultFabGroupProps.testID!);

    expect(component.props.open).toBe(false);
  });

  it("SHOULD render with custom actions", () => {
    const customActions = [
      { icon: "save", onPress: jest.fn() },
      { icon: "share", onPress: jest.fn() },
    ];
    setupFabGroup({ actions: customActions });

    const component = screen.getByTestId(defaultFabGroupProps.testID!);

    expect(component.props.actions).toEqual(customActions);
  });

  it("SHOULD render with visible false", () => {
    setupFabGroup({ visible: false });

    const component = screen.getByTestId(defaultFabGroupProps.testID!);

    expect(component.props.visible).toBe(false);
  });

  it("SHOULD default visible to true when not provided", () => {
    setupFabGroup({ visible: undefined });

    const component = screen.getByTestId(defaultFabGroupProps.testID!);

    expect(component.props.visible).toBe(true);
  });
});