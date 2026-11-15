import { fireEvent, screen } from "@tests";

import { baseProps, setup } from "./mocks/index.mocks";

function open() {
  fireEvent(screen.getByTestId("tk-input"), "focus");
}

describe("TickerAutocomplete", () => {
  it("SHOULD list the suggestions with ticker, name AND last price once focused", () => {
    setup();
    open();

    expect(screen.getByText("R$ 152,30")).toBeTruthy();
    expect(screen.getByText("R$ 10,61")).toBeTruthy();
  });

  it("SHOULD show the class badge of a suggestion AND nothing WHEN it has none", () => {
    setup();
    open();

    expect(screen.getByTestId("tk-suggestion-KNRI11-badge")).toBeTruthy();
    expect(screen.getByText("FII")).toBeTruthy();
    expect(screen.queryByTestId("tk-suggestion-ITSA3-badge")).toBeNull();
  });

  it("SHOULD tell which ticker was picked", () => {
    setup();
    open();
    fireEvent.press(screen.getByTestId("tk-suggestion-ITSA3"));

    expect(baseProps.onSelect).toHaveBeenCalledWith("ITSA3");
  });

  it("SHOULD pass the typed text up AND show the error", () => {
    setup({ error: "No asset found", value: "xyz" });

    fireEvent.changeText(screen.getByTestId("tk-input"), "xyzw");

    expect(baseProps.onChangeText).toHaveBeenCalledWith("xyzw");
    expect(screen.getByText("No asset found")).toBeTruthy();
  });

  it("SHOULD list nothing WHEN there are no suggestions", () => {
    setup({ suggestions: [] });
    open();

    expect(screen.queryByText("R$ 152,30")).toBeNull();
  });
});
