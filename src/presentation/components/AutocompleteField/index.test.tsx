import { act, fireEvent, screen } from "@tests";

import { scrollIntoView } from "./";
import { chipsProps, setup, textProps } from "./mocks/index.mocks";

function input() {
  return screen.getByTestId("ac-input");
}
function key(name: string) {
  fireEvent(input(), "keyPress", { nativeEvent: { key: name } });
}
function open() {
  fireEvent(input(), "focus");
}

describe("chips mode", () => {
  it("SHOULD open the suggestions on focus AND list them with their meta", () => {
    setup();
    expect(screen.queryByTestId("ac-menu")).toBeNull();
    open();
    expect(screen.getByTestId("ac-suggestion-gasto-fixo")).toBeTruthy();
    expect(screen.getByTestId("ac-suggestion-viagem")).toBeTruthy();
    expect(screen.getByText("24")).toBeTruthy();
  });

  it("SHOULD filter by what is typed ignoring case AND offer to create it", () => {
    setup();
    open();
    fireEvent.changeText(input(), "GASTO");
    expect(chipsProps.onQueryChange).toHaveBeenCalledWith("GASTO");
    expect(screen.queryByTestId("ac-suggestion-viagem")).toBeNull();
    expect(screen.getByTestId("ac-suggestion-Gasto Variável")).toBeTruthy();
    expect(screen.getByTestId("ac-create")).toBeTruthy();
  });

  it("SHOULD NOT offer to create WHEN the text matches a suggestion exactly (ignoring case)", () => {
    setup();
    open();
    fireEvent.changeText(input(), "VIAGEM");
    expect(screen.queryByTestId("ac-create")).toBeNull();
  });

  it("SHOULD add the suggestion on tap AND clear the query", () => {
    setup();
    open();
    fireEvent.press(screen.getByTestId("ac-suggestion-viagem"));
    expect(chipsProps.onChange).toHaveBeenCalledWith(["viagem"]);
  });

  it("SHOULD add the TYPED text (not the row label) on Create", () => {
    setup();
    open();
    fireEvent.changeText(input(), "presente");
    fireEvent.press(screen.getByTestId("ac-create"));
    expect(chipsProps.onChange).toHaveBeenCalledWith(["presente"]);
    expect(input().props.value).toBe("");
  });

  it("SHOULD create with Enter WHEN nothing is highlighted AND pick the highlighted option after arrows", () => {
    setup();
    open();
    fireEvent.changeText(input(), "zzz");
    fireEvent(input(), "submitEditing");
    expect(chipsProps.onChange).toHaveBeenLastCalledWith(["zzz"]);

    fireEvent.changeText(input(), "gasto");
    key("ArrowDown");
    key("ArrowDown");
    fireEvent(input(), "submitEditing");
    expect(chipsProps.onChange).toHaveBeenLastCalledWith(["Gasto Variável"]);
  });

  it("SHOULD wrap the highlight around with ArrowUp", () => {
    setup();
    open();
    fireEvent.changeText(input(), "gasto");
    key("ArrowUp");
    fireEvent(input(), "submitEditing");
    expect(chipsProps.onChange).toHaveBeenLastCalledWith(["gasto"]);
  });

  it("SHOULD NOT add the same value twice (ignoring case) AND hide chosen values from the list", () => {
    setup({ values: ["Viagem"] });
    open();
    expect(screen.queryByTestId("ac-suggestion-viagem")).toBeNull();
    fireEvent.changeText(input(), "viagem");
    expect(screen.queryByTestId("ac-create")).toBeNull();
  });

  it("SHOULD remove a chip with its x button", () => {
    setup({ values: ["a", "b"] });
    fireEvent.press(screen.getByTestId("ac-chip-remove-a"));
    expect(chipsProps.onChange).toHaveBeenCalledWith(["b"]);
    expect(screen.getByLabelText("Remove a")).toBeTruthy();
  });

  it("SHOULD remove the last chip with Backspace on an empty input only", () => {
    setup({ maxValues: 5, values: ["a", "b"] });
    fireEvent.changeText(input(), "x");
    key("Backspace");
    expect(chipsProps.onChange).not.toHaveBeenCalled();
    fireEvent.changeText(input(), "");
    key("Backspace");
    expect(chipsProps.onChange).toHaveBeenCalledWith(["a"]);
  });

  it("SHOULD stop accepting text AND show the max label AT maxValues", () => {
    setup({ values: ["a", "b"] });
    expect(input().props.editable).toBe(false);
    expect(screen.getByTestId("ac-helper").props.children).toBe("Up to 2 tags");
    open();
    expect(screen.queryByTestId("ac-menu")).toBeNull();
  });

  it("SHOULD show the too-long error AND not offer to create WHEN over maxLength", () => {
    setup();
    open();
    fireEvent.changeText(input(), "x".repeat(11));
    expect(screen.getByTestId("ac-error").props.children).toBe("Too long");
    expect(screen.queryByTestId("ac-create")).toBeNull();
  });

  it("SHOULD NOT offer to create WHEN creating is not allowed", () => {
    setup({ allowCreate: false });
    open();
    fireEvent.changeText(input(), "zzz");
    expect(screen.queryByTestId("ac-menu")).toBeNull();
  });

  it("SHOULD close on Escape AND (after a short delay) on blur", () => {
    setup();
    open();
    key("Escape");
    expect(screen.queryByTestId("ac-menu")).toBeNull();
    open();
    fireEvent(input(), "blur");
    expect(screen.getByTestId("ac-menu")).toBeTruthy();
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(screen.queryByTestId("ac-menu")).toBeNull();
  });

  it("SHOULD NOT close on blur WHEN a press started inside the list (the tap still lands)", () => {
    setup();
    open();
    const menu = screen.getByTestId("ac-menu");

    fireEvent(menu, "startShouldSetResponderCapture");
    fireEvent(input(), "blur");
    act(() => {
      jest.advanceTimersByTime(500);
    });
    expect(screen.getByTestId("ac-menu")).toBeTruthy();

    fireEvent.press(screen.getByTestId("ac-suggestion-viagem"));
    expect(chipsProps.onChange).toHaveBeenCalledWith(["viagem"]);
  });

  it("SHOULD keep the list open WHEN focus returns before the delay ends", () => {
    setup();
    open();
    fireEvent(input(), "blur");
    open();
    act(() => {
      jest.advanceTimersByTime(200);
    });
    expect(screen.getByTestId("ac-menu")).toBeTruthy();
  });

  it("SHOULD announce the number of suggestions AND limit the list to maxSuggestions", () => {
    setup({ maxSuggestions: 1 });
    open();
    expect(screen.getByText("1 suggestions")).toBeTruthy();
  });

  it("SHOULD be disabled", () => {
    setup({ disabled: true });
    expect(input().props.editable).toBe(false);
  });

  it("SHOULD show the error of the field over the helper", () => {
    setup({ error: "Bad" });
    expect(screen.getByTestId("ac-error").props.children).toBe("Bad");
  });
});

describe("text mode", () => {
  it("SHOULD forward typing AND suggest matches", () => {
    setup({ mode: "text", value: "via" } as never);
    open();
    expect(screen.getByTestId("ac-suggestion-viagem")).toBeTruthy();
    expect(screen.queryByTestId("ac-create")).toBeNull();
    fireEvent.changeText(input(), "viagem 2");
    expect(textProps.onChangeText).toHaveBeenCalledWith("viagem 2");
  });

  it("SHOULD fill the text AND report the suggestion on pick", () => {
    setup({ mode: "text", value: "g" } as never);
    open();
    fireEvent.press(screen.getByTestId("ac-suggestion-gasto-fixo"));
    expect(textProps.onChangeText).toHaveBeenCalledWith("gasto-fixo");
    expect(textProps.onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ id: "1" }),
    );
  });

  it("SHOULD pick the highlighted option with Enter, and do nothing when none is highlighted", () => {
    setup({ mode: "text", value: "g" } as never);
    open();
    fireEvent(input(), "submitEditing");
    expect(textProps.onChangeText).not.toHaveBeenCalled();
    key("ArrowDown");
    fireEvent(input(), "submitEditing");
    expect(textProps.onChangeText).toHaveBeenCalledWith("gasto-fixo");
  });

  it("SHOULD ignore Backspace", () => {
    setup({ mode: "text", value: "" } as never);
    key("Backspace");
    expect(textProps.onChangeText).not.toHaveBeenCalled();
  });
});

describe("scrollIntoView", () => {
  it("SHOULD bring the node into view WHEN the platform can", () => {
    const node = { scrollIntoView: jest.fn() };

    scrollIntoView(node);

    expect(node.scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
  });

  it("SHOULD do nothing for a node that cannot scroll (native) or no node", () => {
    expect(() => scrollIntoView({})).not.toThrow();
    expect(() => scrollIntoView(null)).not.toThrow();
  });
});
