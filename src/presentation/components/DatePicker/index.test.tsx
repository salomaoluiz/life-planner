import { act, fireEvent, screen } from "@tests";

import { defaultProps, setup } from "./mocks/index.mocks";

describe("DatePicker", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SHOULD render the date picker with the correct props", () => {
    setup();

    const component = screen.getByTestId(defaultProps.testID!);

    expect(component).toBeTruthy();
    expect(component.props.testID).toBe(defaultProps.testID);
  });

  it("SHOULD render with label", () => {
    setup();

    const component = screen.getByTestId(defaultProps.testID!);

    // The label is rendered inside the component structure
    expect(component).toBeTruthy();
  });

  it("SHOULD render without date initially", () => {
    setup();

    screen.getByTestId(defaultProps.testID!);

    // When no date is provided, the clear button should not be present
    const clearButton = screen.queryByTestId(
      `${defaultProps.testID}-clear-button`,
    );
    expect(clearButton).toBeNull();
  });

  it("SHOULD render with date when provided", () => {
    const testDate = new Date("2023-12-25");
    setup({ date: testDate });

    screen.getByTestId(defaultProps.testID!);

    // When date is provided, the clear button should be present
    const clearButton = screen.getByTestId(
      `${defaultProps.testID}-clear-button`,
    );
    expect(clearButton).toBeTruthy();
  });

  it("SHOULD call onConfirm when date is confirmed", () => {
    setup();

    const modal = screen.getByTestId(`${defaultProps.testID}-modal`);
    const testDate = new Date("2023-12-25");

    act(() => {
      modal.props.onConfirm({ date: testDate });
    });

    expect(defaultProps.onConfirm).toHaveBeenCalledWith({ date: testDate });
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("SHOULD call onDismiss when modal is dismissed", () => {
    setup();

    const modal = screen.getByTestId(`${defaultProps.testID}-modal`);

    act(() => {
      modal.props.onDismiss();
    });

    expect(defaultProps.onDismiss).toHaveBeenCalledTimes(1);
  });

  it("SHOULD show clear button when date is present", () => {
    const testDate = new Date("2023-12-25");
    setup({ date: testDate });

    const clearButton = screen.getByTestId(
      `${defaultProps.testID}-clear-button`,
    );

    expect(clearButton).toBeTruthy();
  });

  it("SHOULD not show clear button when no date is present", () => {
    setup();

    const clearButton = screen.queryByTestId(
      `${defaultProps.testID}-clear-button`,
    );

    expect(clearButton).toBeNull();
  });

  it("SHOULD clear date when clear button is pressed", () => {
    const testDate = new Date("2023-12-25");
    setup({ date: testDate });

    const clearButton = screen.getByTestId(
      `${defaultProps.testID}-clear-button`,
    );

    act(() => {
      clearButton.props.onPress();
    });

    expect(defaultProps.onConfirm).toHaveBeenCalledWith({ date: undefined });
    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it("SHOULD render as a pressable component", () => {
    setup();

    const component = screen.getByTestId(defaultProps.testID!);

    // Test that the component is accessible (indicating it's pressable)
    expect(component.props.accessible).toBe(true);
    expect(component.props.testID).toBe(defaultProps.testID);
  });

  it("SHOULD have correct modal props", () => {
    const testDate = new Date("2023-12-25");
    setup({ date: testDate });

    const modal = screen.getByTestId(`${defaultProps.testID}-modal`);

    expect(modal.props).toEqual({
      date: testDate,
      label: defaultProps.label,
      locale: "en-US",
      mode: defaultProps.mode,
      onConfirm: expect.any(Function),
      onDismiss: expect.any(Function),
      saveLabel: "Save",
      testID: `${defaultProps.testID}-modal`,
      visible: false, // Initially false in component state
    });
  });

  it("SHOULD handle onDismiss when not provided", () => {
    setup({ onDismiss: undefined });

    const modal = screen.getByTestId(`${defaultProps.testID}-modal`);

    // Should not throw when onDismiss is called
    expect(() => {
      act(() => {
        modal.props.onDismiss();
      });
    }).not.toThrow();
  });

  it("SHOULD pass correct mode to modal", () => {
    setup({ mode: "single" });

    const modal = screen.getByTestId(`${defaultProps.testID}-modal`);

    expect(modal.props.mode).toBe("single");
  });

  it("SHOULD use correct locale for modal", () => {
    setup();

    const modal = screen.getByTestId(`${defaultProps.testID}-modal`);

    expect(modal.props.locale).toBe("en-US");
  });

  it("SHOULD open modal when DatePicker is pressed", () => {
    setup();

    const component = screen.getByTestId(defaultProps.testID!);
    const modal = screen.getByTestId(`${defaultProps.testID}-modal`);

    // Initially modal should be closed
    expect(modal.props.visible).toBe(false);

    // Press the main component
    fireEvent.press(component);

    // Modal should now be visible
    expect(modal.props.visible).toBe(true);
  });
});
