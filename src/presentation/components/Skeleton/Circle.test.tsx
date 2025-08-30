import { screen } from "@tests";

import { defaultProps, setup } from "./mocks/Circle.mocks";

it("SHOULD render circle skeleton with correct size", () => {
  setup();

  const loader = screen.getByTestId("skeleton-loader");
  const circle = screen.getByTestId("skeleton-circle");

  expect(loader).toBeDefined();
  expect(circle).toBeDefined();
  expect(loader.props.width).toBe(defaultProps.size);
  expect(loader.props.height).toBe(defaultProps.size);
});

it("SHOULD position circle at center", () => {
  setup();

  const circle = screen.getByTestId("skeleton-circle");
  expect(circle.props.cx).toBe(defaultProps.size);
  expect(circle.props.cy).toBe(defaultProps.size);
  expect(circle.props.r).toBe(defaultProps.size);
});

it("SHOULD handle different sizes", () => {
  const customSize = 80;
  setup({ size: customSize });

  const loader = screen.getByTestId("skeleton-loader");
  const circle = screen.getByTestId("skeleton-circle");

  expect(loader.props.width).toBe(customSize);
  expect(loader.props.height).toBe(customSize);
  expect(circle.props.cx).toBe(customSize);
  expect(circle.props.cy).toBe(customSize);
  expect(circle.props.r).toBe(customSize);
});