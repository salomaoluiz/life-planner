import { render, screen } from "@tests";

import FocusRing from "./";

it("SHOULD render nothing WHEN not visible", () => {
  render(<FocusRing radius={14} visible={false} />);

  expect(screen.queryByTestId("focus-ring")).toBeNull();
});

it("SHOULD render a non-interactive ring with the given radius WHEN visible", () => {
  render(<FocusRing radius={14} visible />);

  const ring = screen.getByTestId("focus-ring");

  expect(ring.props.pointerEvents).toBe("none");
  expect(ring.props.style).toEqual(
    expect.objectContaining({ borderRadius: 18, borderWidth: 4 }),
  );
});
