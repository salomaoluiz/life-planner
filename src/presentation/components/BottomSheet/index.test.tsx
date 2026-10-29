import { AccessibilityInfo, Modal, StyleSheet, Text } from "react-native";

import { act, fireEvent, render, screen, waitFor, within } from "@tests";

import { BottomSheet, useSheetLayout } from "@components";
import { lightTheme } from "@presentation/theme/provider";
import { isWeb } from "@utils/platform";

import { onClose, setup } from "./mocks/index.mocks";

jest.mock("@utils/platform", () => ({ isWeb: jest.fn() }));

function stubDocument() {
  const handlers: Record<string, (event: { key: string }) => void> = {};
  const documentStub = {
    addEventListener: jest.fn((type: string, handler: never) => {
      handlers[type] = handler;
    }),
    removeEventListener: jest.fn(),
  };
  Object.defineProperty(globalThis, "document", {
    configurable: true,
    value: documentStub,
  });

  return { documentStub, handlers };
}

afterEach(() => {
  jest.mocked(isWeb).mockReset();
  Reflect.deleteProperty(globalThis, "document");
});

it("SHOULD use 20 px padding in header, body and footer", () => {
  setup({ footer: <Text>footer</Text> });
  expect(
    StyleSheet.flatten(
      screen.getByTestId("sheet-body").props.contentContainerStyle,
    ).padding,
  ).toBe(20);
  expect(
    StyleSheet.flatten(screen.getByTestId("sheet-footer").props.style).padding,
  ).toBe(20);
});

it("SHOULD theme the scrollbar on web", () => {
  jest.mocked(isWeb).mockReturnValue(true);
  stubDocument();
  setup();
  expect(
    StyleSheet.flatten(screen.getByTestId("sheet-body").props.style),
  ).toEqual(
    expect.objectContaining({
      scrollbarColor: `${lightTheme.colors.border} transparent`,
    }),
  );
});

it("SHOULD call onClose WHEN Escape is pressed on web", () => {
  jest.mocked(isWeb).mockReturnValue(true);
  const { handlers } = stubDocument();
  setup();
  handlers.keydown({ key: "Escape" });
  expect(onClose).toHaveBeenCalledTimes(1);
});

it("SHOULD close only the top-most sheet WHEN Escape is pressed with stacked sheets", () => {
  jest.mocked(isWeb).mockReturnValue(true);
  const { documentStub } = stubDocument();
  const handlers: ((event: { key: string }) => void)[] = [];
  documentStub.addEventListener.mockImplementation((_type, handler) => {
    handlers.push(handler as never);
  });
  const parentClose = jest.fn();
  const childClose = jest.fn();
  render(
    <>
      <BottomSheet closeLabel="Close" onClose={parentClose} title="A" visible>
        <Text>a</Text>
      </BottomSheet>
      <BottomSheet closeLabel="Close" onClose={childClose} title="B" visible>
        <Text>b</Text>
      </BottomSheet>
    </>,
  );

  handlers.forEach((handler) => handler({ key: "Escape" }));

  expect(childClose).toHaveBeenCalledTimes(1);
  expect(parentClose).not.toHaveBeenCalled();
});

it("SHOULD ignore other keys on web", () => {
  jest.mocked(isWeb).mockReturnValue(true);
  const { handlers } = stubDocument();
  setup();
  handlers.keydown({ key: "Enter" });
  expect(onClose).not.toHaveBeenCalled();
});

it("SHOULD NOT listen WHEN not visible or on native, and SHOULD remove the listener on unmount", () => {
  jest.mocked(isWeb).mockReturnValue(true);
  const { documentStub } = stubDocument();
  setup({ visible: false });
  expect(documentStub.addEventListener).not.toHaveBeenCalled();

  jest.mocked(isWeb).mockReturnValue(false);
  setup();
  expect(documentStub.addEventListener).not.toHaveBeenCalled();

  jest.mocked(isWeb).mockReturnValue(true);
  screen.unmount();
  setup();
  screen.unmount();
  expect(documentStub.removeEventListener).toHaveBeenCalledWith(
    "keydown",
    expect.any(Function),
  );
});

it("SHOULD render nothing WHEN not visible", () => {
  setup({ visible: false });
  expect(screen.queryByTestId("sheet")).toBeNull();
});

it("SHOULD render the subtitle under the title WHEN given", () => {
  setup({ subtitle: "Silva family" });
  expect(screen.getByTestId("sheet-subtitle").props.children).toBe(
    "Silva family",
  );
});

it("SHOULD not render a subtitle by default", () => {
  setup();
  expect(screen.queryByTestId("sheet-subtitle")).toBeNull();
});

it("SHOULD render title, body and a header close button", () => {
  setup();
  expect(screen.getByTestId("sheet-title").props.children).toBe("New item");
  expect(screen.getByText("body")).toBeTruthy();
  expect(screen.getByTestId("sheet-close").props.accessibilityLabel).toBe(
    "Close",
  );
});

it("SHOULD close via the close button, backdrop and Android back exactly once each", () => {
  setup();
  fireEvent.press(screen.getByTestId("sheet-close"));
  fireEvent.press(screen.getByTestId("sheet-backdrop"));
  act(() => screen.UNSAFE_getByType(Modal).props.onRequestClose());
  expect(onClose).toHaveBeenCalledTimes(3);
});

it("SHOULD close on a swipe down on the grabber but not on a short drag", () => {
  setup();
  const grabber = screen.getByTestId("sheet-grabber", {
    includeHiddenElements: true,
  });
  function touchEvent(y: number) {
    const touch = {
      currentPageX: 0,
      currentPageY: y,
      currentTimeStamp: 1,
      previousPageX: 0,
      previousPageY: 0,
      previousTimeStamp: 1,
      startPageX: 0,
      startPageY: 0,
      startTimeStamp: 1,
      touchActive: true,
    };
    return {
      nativeEvent: {},
      touchHistory: {
        indexOfSingleActiveTouch: 0,
        mostRecentTimeStamp: 1,
        numberActiveTouches: 1,
        touchBank: [touch],
      },
    };
  }
  function move(dy: number) {
    grabber.props.onResponderGrant(touchEvent(0));
    grabber.props.onResponderMove(touchEvent(dy));
    grabber.props.onResponderRelease(touchEvent(dy));
  }
  move(20);
  expect(onClose).not.toHaveBeenCalled();
  move(120);
  expect(onClose).toHaveBeenCalledTimes(1);
});

it("SHOULD render the sticky footer WHEN given", () => {
  setup({ footer: <Text>footer</Text> });
  expect(screen.getByTestId("sheet-footer")).toBeTruthy();
  expect(screen.getByText("footer")).toBeTruthy();
});

it("SHOULD not render a footer area WHEN none is given", () => {
  setup();
  expect(screen.queryByTestId("sheet-footer")).toBeNull();
});

it("SHOULD use top radius sheet and surface on compact, capped at 90% height", () => {
  setup();
  const style = StyleSheet.flatten(screen.getByTestId("sheet").props.style);
  expect(style.backgroundColor).toBe(lightTheme.colors.surface);
  expect(style.borderTopLeftRadius).toBe(lightTheme.sizes.borderRadius.sheet);
  expect(style.maxHeight).toBe("90%");
});

it.each(["medium", "expanded"] as const)(
  "SHOULD be a centered 480 px dialog on %s",
  (breakpoint) => {
    setup({}, breakpoint);
    const style = StyleSheet.flatten(screen.getByTestId("sheet").props.style);
    expect(style.maxWidth).toBe(480);
    expect(style.borderRadius).toBe(lightTheme.sizes.borderRadius.lg);
  },
);

it("SHOULD render without a Modal WHEN inline", () => {
  setup({ presentation: "inline" });
  expect(screen.UNSAFE_queryAllByType(Modal)).toHaveLength(0);
  expect(screen.getByTestId("sheet")).toBeTruthy();
});

it("SHOULD respect reduce motion by not animating", async () => {
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(true);
  setup();
  await waitFor(() => expect(screen.getByTestId("sheet")).toBeTruthy());
});

function LayoutProbe() {
  return <Text testID="probe">{useSheetLayout().columns}</Text>;
}

it.each([
  ["medium", 720],
  ["expanded", 880],
] as const)("SHOULD be a %s wide form dialog of %i px", (breakpoint, width) => {
  setup({ size: "form" }, breakpoint);
  const style = StyleSheet.flatten(screen.getByTestId("sheet").props.style);
  expect(style.maxWidth).toBe(width);
});

it.each([
  ["medium", 720],
  ["expanded", 1040],
] as const)(
  "SHOULD be a %s wide wizard dialog of %i px",
  (breakpoint, width) => {
    setup({ size: "wizard" }, breakpoint);
    const style = StyleSheet.flatten(screen.getByTestId("sheet").props.style);
    expect(style.maxWidth).toBe(width);
  },
);

it("SHOULD keep a dialog at 480 px even next to a form", () => {
  setup({ size: "dialog" }, "expanded");
  expect(
    StyleSheet.flatten(screen.getByTestId("sheet").props.style).maxWidth,
  ).toBe(480);
});

it("SHOULD render a form like a dialog on compact", () => {
  setup({ size: "form" });
  const style = StyleSheet.flatten(screen.getByTestId("sheet").props.style);
  expect(style.maxWidth).toBeUndefined();
  expect(style.borderTopLeftRadius).toBe(lightTheme.sizes.borderRadius.sheet);
  expect(
    StyleSheet.flatten(
      screen.getByTestId("sheet-body").props.contentContainerStyle,
    ).padding,
  ).toBe(20);
});

it("SHOULD use roomier body paddings on a wide form", () => {
  setup({ size: "form" }, "expanded");
  const body = StyleSheet.flatten(
    screen.getByTestId("sheet-body").props.contentContainerStyle,
  );
  expect(body.paddingHorizontal).toBe(32);
  expect(body.paddingVertical).toBe(24);
});

it("SHOULD put footerStart and the footer on one bordered row on a wide form", () => {
  setup(
    {
      footer: <Text>save</Text>,
      footerStart: <Text>delete</Text>,
      size: "form",
    },
    "expanded",
  );
  const footer = screen.getByTestId("sheet-footer");
  const style = StyleSheet.flatten(footer.props.style);
  expect(style.borderTopWidth).toBe(1);
  expect(style.justifyContent).toBe("space-between");
  expect(within(footer).getByText("delete")).toBeTruthy();
  expect(within(footer).getByText("save")).toBeTruthy();
  expect(
    within(screen.getByTestId("sheet-body")).queryByText("delete"),
  ).toBeNull();
});

it("SHOULD align only the footer to the end WHEN there is no footerStart", () => {
  setup({ footer: <Text>save</Text>, size: "form" }, "expanded");
  expect(
    StyleSheet.flatten(screen.getByTestId("sheet-footer").props.style)
      .justifyContent,
  ).toBe("flex-end");
});

it("SHOULD stack the footer and footerSecondary, footer first, WHEN compact", () => {
  setup(
    {
      footer: <Text>save</Text>,
      footerSecondary: <Text>save and new</Text>,
      size: "form",
    },
    "compact",
  );
  const footer = screen.getByTestId("sheet-footer");
  const texts = within(footer)
    .getAllByText(/save/)
    .map((node) => node.props.children);

  expect(texts).toEqual(["save", "save and new"]);
  expect(StyleSheet.flatten(footer.props.style).flexDirection).not.toBe("row");
});

it("SHOULD put footerSecondary before the footer on one end-aligned row on a wide form", () => {
  setup(
    {
      footer: <Text>save</Text>,
      footerSecondary: <Text>save and new</Text>,
      size: "form",
    },
    "expanded",
  );
  const footer = screen.getByTestId("sheet-footer");
  const texts = within(footer)
    .getAllByText(/save/)
    .map((node) => node.props.children);

  expect(texts).toEqual(["save and new", "save"]);
  expect(StyleSheet.flatten(footer.props.style).justifyContent).toBe(
    "flex-end",
  );
});

it.each([
  ["compact", "form"],
  ["expanded", "dialog"],
] as const)(
  "SHOULD keep footerStart in the body on %s %s",
  (breakpoint, size) => {
    setup(
      { footer: <Text>save</Text>, footerStart: <Text>delete</Text>, size },
      breakpoint,
    );
    expect(
      within(screen.getByTestId("sheet-body")).getByText("delete"),
    ).toBeTruthy();
    expect(
      within(screen.getByTestId("sheet-footer")).queryByText("delete"),
    ).toBeNull();
  },
);

it.each([
  ["compact", "form", "1"],
  ["expanded", "dialog", "1"],
  ["expanded", "form", "2"],
  ["medium", "form", "2"],
] as const)(
  "SHOULD report the sheet layout on %s %s as %s columns",
  (breakpoint, size, columns) => {
    setup({ children: <LayoutProbe />, size }, breakpoint);
    expect(screen.getByTestId("probe").props.children).toBe(Number(columns));
  },
);

function FluidProbe() {
  return <Text testID="fluid-probe">{String(!!useSheetLayout().fluid)}</Text>;
}

it("SHOULD let the panes scroll and fix the height WHEN paneScroll on a wide form", () => {
  setup(
    { children: <FluidProbe />, paneScroll: true, size: "form" },
    "expanded",
  );

  expect(screen.getByTestId("fluid-probe")).toHaveTextContent("true");
  expect(screen.getByTestId("sheet-body").props.contentContainerStyle).toBe(
    undefined,
  );
  expect(
    StyleSheet.flatten(screen.getByTestId("sheet").props.style).height,
  ).toBeGreaterThan(0);
});

it("SHOULD keep one scrolling body WHEN paneScroll on a compact window or without it", () => {
  setup({ children: <FluidProbe />, paneScroll: true, size: "form" });

  expect(screen.getByTestId("fluid-probe")).toHaveTextContent("false");
  expect(
    screen.getByTestId("sheet-body").props.contentContainerStyle,
  ).toBeDefined();
});
