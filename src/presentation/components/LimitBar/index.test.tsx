import { render, screen } from "@tests";

import { LimitBar } from "@components";

it("SHOULD expose the consumed and projected shares with the label", () => {
  render(
    <LimitBar
      accessibilityLabel="Card limit"
      consumedPct={39}
      projectedPct={6.4}
      testID="bar"
    />,
  );

  expect(screen.getByTestId("bar").props.accessibilityLabel).toBe("Card limit");
  expect(screen.getByTestId("bar-consumed").props.style).toMatchObject({
    width: "39%",
  });
  expect(screen.getByTestId("bar-projected").props.style).toMatchObject({
    width: "6.4%",
  });
});

it("SHOULD clamp the shares to the bar", () => {
  render(
    <LimitBar
      accessibilityLabel="x"
      consumedPct={120}
      projectedPct={-5}
      testID="bar"
    />,
  );

  expect(screen.getByTestId("bar-consumed").props.style).toMatchObject({
    width: "100%",
  });
  expect(screen.getByTestId("bar-projected").props.style).toMatchObject({
    width: "0%",
  });
});
