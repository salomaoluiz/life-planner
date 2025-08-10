import { ReactTestInstance } from "react-test-renderer";

import { act, screen } from "@tests";

import { defaultProps, setup } from "./mocks/index.mocks";

describe("Picker Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("SHOULD render Picker with correct container", () => {
    setup();

    const container = screen.getByTestId(defaultProps.testID!);
    expect(container).toBeTruthy();
  });

  it("SHOULD render Picker with selected value", () => {
    setup();

    const container = screen.getByTestId(defaultProps.testID!);

    // The RNPicker should be the first child of the container
    const picker = container.props.children;
    expect(picker.props.selectedValue).toBe(defaultProps.selectedValue);
  });

  it("SHOULD render all items correctly", () => {
    setup();

    const container = screen.getByTestId(defaultProps.testID!);
    const picker = container.props.children;

    // The items should be rendered as children of the picker
    const items = picker.props.children;
    expect(items).toHaveLength(defaultProps.items.length);
  });

  it("SHOULD call onValueChange when value changes", () => {
    setup();

    const container = screen.getByTestId(defaultProps.testID!);
    const picker = container.props.children;

    act(() => {
      picker.props.onValueChange("option2");
    });

    expect(defaultProps.onValueChange).toHaveBeenCalledWith("option2");
    expect(defaultProps.onValueChange).toHaveBeenCalledTimes(1);
  });

  it("SHOULD handle different value types", () => {
    const numberItems = [
      { label: "One", value: 1 },
      { label: "Two", value: 2 },
      { label: "Three", value: 3 },
    ];

    const mockOnValueChange = jest.fn();

    setup({
      items: numberItems,
      onValueChange: mockOnValueChange,
      selectedValue: 2,
    });

    const container = screen.getByTestId(defaultProps.testID!);
    const picker = container.props.children;
    expect(picker.props.selectedValue).toBe(2);

    act(() => {
      picker.props.onValueChange(3);
    });

    expect(mockOnValueChange).toHaveBeenCalledWith(3);
  });

  it("SHOULD render with correct styling", () => {
    setup();

    const container = screen.getByTestId(defaultProps.testID!);
    const picker = container.props.children;

    expect(picker.props.style).toBeDefined();
    expect(picker.props.dropdownIconColor).toBeDefined();
  });

  it("SHOULD render items with correct labels and values", () => {
    setup();

    const container = screen.getByTestId(defaultProps.testID!);
    const picker = container.props.children;
    const items = picker.props.children;

    items.forEach((item: ReactTestInstance, index: number) => {
      expect(item.props.label).toBe(defaultProps.items[index].label);
      expect(item.props.value).toBe(defaultProps.items[index].value);
      expect(item.props.style).toBeDefined();
      expect(item.key).toBe(index.toString());
    });
  });

  it("SHOULD handle empty items array", () => {
    setup({ items: [] });

    const container = screen.getByTestId(defaultProps.testID!);
    const picker = container.props.children;
    const items = picker.props.children;
    expect(items).toHaveLength(0);
  });

  it("SHOULD handle single item", () => {
    const singleItem = [{ label: "Only Option", value: "only" }];
    setup({
      items: singleItem,
      selectedValue: "only",
    });

    const container = screen.getByTestId(defaultProps.testID!);
    const picker = container.props.children;
    const items = picker.props.children;
    expect(items).toHaveLength(1);
    expect(items[0].props.label).toBe("Only Option");
    expect(items[0].props.value).toBe("only");
  });

  it("SHOULD maintain selectedValue consistency", () => {
    const testValue = "test-value";
    setup({ selectedValue: testValue });

    const container = screen.getByTestId(defaultProps.testID!);
    const picker = container.props.children;
    expect(picker.props.selectedValue).toBe(testValue);
  });

  it("SHOULD pass onValueChange function correctly", () => {
    setup();

    const container = screen.getByTestId(defaultProps.testID!);
    const picker = container.props.children;

    expect(picker.props.onValueChange).toEqual(expect.any(Function));
  });

  it("SHOULD render with correct dropdownIconColor", () => {
    setup();

    const container = screen.getByTestId(defaultProps.testID!);
    const picker = container.props.children;

    expect(picker.props.dropdownIconColor).toBeDefined();
  });
});
