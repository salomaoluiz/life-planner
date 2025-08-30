import { screen } from "@tests";

import { defaultProps, setup } from "./mocks/Box.mocks";

it("SHOULD render box skeleton with correct dimensions", () => {
  setup();

  const loader = screen.getByTestId("skeleton-loader");
  const rect = screen.getByTestId("skeleton-rect");

  expect(loader).toBeDefined();
  expect(rect).toBeDefined();
  expect(loader.props.width).toBe(100);
  expect(loader.props.height).toBe(50);
});

it("SHOULD apply custom border radius when provided", () => {
  const borderRadius = 10;
  setup({ borderRadius });

  const rect = screen.getByTestId("skeleton-rect");
  expect(rect.props.rx).toBe(borderRadius);
  expect(rect.props.ry).toBe(borderRadius);
});

it("SHOULD use default border radius when not provided", () => {
  setup();

  const rect = screen.getByTestId("skeleton-rect");
  expect(rect.props.rx).toBe(8); // Default medium border radius
  expect(rect.props.ry).toBe(8);
});

it("SHOULD handle string dimensions", () => {
  setup({ width: "200", height: "100" });

  const loader = screen.getByTestId("skeleton-loader");
  expect(loader.props.width).toBe(200);
  expect(loader.props.height).toBe(100);
});