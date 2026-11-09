import { useState } from "react";
import { Pressable, Text } from "react-native";

import { fireEvent, render, screen } from "@tests";

import { AdaptiveLayout, AdaptiveViewProps, useDensity } from "@components";
import * as theme from "@presentation/theme";

type VM = { count: number; increment: () => void };

function Compact({ vm }: AdaptiveViewProps<VM>) {
  const { density, view } = useDensity();

  return (
    <Pressable onPress={vm.increment} testID="compact">
      <Text testID="label">{`compact ${vm.count} ${density} ${view}`}</Text>
    </Pressable>
  );
}

function label() {
  return screen.getByTestId("label").props.children;
}

function Screen({ withCompact }: { withCompact: boolean }) {
  const [count, setCount] = useState(0);
  const vm: VM = { count, increment: () => setCount((value) => value + 1) };

  return (
    <AdaptiveLayout
      compact={withCompact ? Compact : undefined}
      vm={vm}
      wide={Wide}
    />
  );
}

function setBreakpoint(breakpoint: "compact" | "expanded" | "medium") {
  jest.mocked(theme.useBreakpoint).mockReturnValue(breakpoint);
}

function Wide({ vm }: AdaptiveViewProps<VM>) {
  const { density, view } = useDensity();

  return (
    <Pressable onPress={vm.increment} testID="wide">
      <Text testID="label">{`wide ${vm.count} ${density} ${view}`}</Text>
    </Pressable>
  );
}

describe("AdaptiveLayout", () => {
  it.each(["compact", "medium", "expanded"] as const)(
    "SHOULD render wide on %s WHEN there is no compact View",
    (breakpoint) => {
      setBreakpoint(breakpoint);
      render(<Screen withCompact={false} />);
      expect(screen.getByTestId("wide")).toBeTruthy();
    },
  );

  it("SHOULD give the wide View the same vm object", () => {
    setBreakpoint("expanded");
    const vm: VM = { count: 7, increment: jest.fn() };
    const seen: VM[] = [];

    function Probe({ vm: received }: AdaptiveViewProps<VM>) {
      seen.push(received);

      return null;
    }
    render(<AdaptiveLayout vm={vm} wide={Probe} />);
    expect(seen[0]).toBe(vm);
  });

  it("SHOULD render compact on a compact width WHEN a compact View exists", () => {
    setBreakpoint("compact");
    render(<Screen withCompact />);
    expect(screen.getByTestId("compact")).toBeTruthy();
    expect(label()).toBe("compact 0 compact compact");
  });

  it.each(["medium", "expanded"] as const)(
    "SHOULD render wide on %s WHEN a compact View exists",
    (breakpoint) => {
      setBreakpoint(breakpoint);
      render(<Screen withCompact />);
      expect(screen.getByTestId("wide")).toBeTruthy();
      expect(label()).toBe("wide 0 regular wide");
    },
  );

  it("SHOULD keep the ViewModel state WHEN the width switches the View", () => {
    setBreakpoint("expanded");
    const { rerender } = render(<Screen withCompact />);

    fireEvent.press(screen.getByTestId("wide"));
    fireEvent.press(screen.getByTestId("wide"));
    setBreakpoint("compact");
    rerender(<Screen withCompact />);
    expect(label()).toBe("compact 2 compact compact");
    setBreakpoint("expanded");
    rerender(<Screen withCompact />);
    expect(label()).toBe("wide 2 regular wide");
  });

  it("SHOULD report compact density with the wide View on a compact width", () => {
    setBreakpoint("compact");
    render(<Screen withCompact={false} />);
    expect(label()).toBe("wide 0 compact wide");
  });

  it("SHOULD render a View with no ViewModel", () => {
    setBreakpoint("expanded");

    function NoVm() {
      return <Text testID="no-vm">ok</Text>;
    }
    render(<AdaptiveLayout wide={NoVm} />);
    expect(screen.getByTestId("no-vm")).toBeTruthy();
  });

  it("SHOULD render the same tree as the wide View alone", () => {
    setBreakpoint("compact");
    const vm: VM = { count: 1, increment: jest.fn() };
    const direct = JSON.stringify(render(<Wide vm={vm} />).toJSON());

    screen.unmount();
    const wrapped = JSON.stringify(
      render(<AdaptiveLayout vm={vm} wide={Wide} />).toJSON(),
    );

    expect(wrapped).toEqual(direct);
  });
});

describe("useDensity", () => {
  it.each([
    ["compact", "compact"],
    ["medium", "regular"],
    ["expanded", "regular"],
  ] as const)(
    "SHOULD follow the breakpoint (%s) outside the container",
    (breakpoint, density) => {
      setBreakpoint(breakpoint);

      function Outside() {
        const value = useDensity();

        return <Text testID="out">{`${value.density} ${value.view}`}</Text>;
      }
      render(<Outside />);
      expect(screen.getByTestId("out").props.children).toBe(`${density} wide`);
    },
  );
});
