import { render } from "@tests";

import Skeleton from "./";
import { screen, setup } from "./mocks/index.mocks";

it("SHOULD render Avatar Skeleton correctly", () => {
  setup.circle();

  const loader = screen.getByTestId("skeleton-loader");
  const circle = screen.getByTestId("skeleton-circle");

  expect(loader.props.style).toEqual([
    { backgroundColor: "transparent", borderWidth: 0 },
    { height: 12, position: "absolute", width: 12, zIndex: 1 },
    { flex: 0, height: 12, width: 12 },
  ]);
  expect(circle.props).toMatchObject({
    cx: 12,
    cy: 12,
    r: 12,
  });
});

it("SHOULD render Box Skeleton correctly", () => {
  setup.box({ borderRadius: 20, height: 100, width: 200 });

  const loader = screen.getByTestId("skeleton-loader");
  const rect = screen.getByTestId("skeleton-rect");

  expect(loader.props).toMatchObject({
    height: 100,
    testID: "skeleton-loader",
    width: 200,
  });
  expect(loader.props.style).toEqual([
    { backgroundColor: "transparent", borderWidth: 0 },
    {},
    { flex: 0, height: 100, width: 200 },
  ]);
  expect(rect.props).toMatchObject({
    height: 100,
    rx: 20,
    ry: 20,
    width: 200,
    x: "0",
    y: "0",
  });
});

it("SHOULD render Box Skeleton with default border radius", () => {
  setup.box({ height: 12, width: 12 });

  const loader = screen.getByTestId("skeleton-loader");
  const rect = screen.getByTestId("skeleton-rect");

  expect(loader.props).toMatchObject({
    height: 12,
    testID: "skeleton-loader",
    width: 12,
  });
  expect(loader.props.style).toEqual([
    { backgroundColor: "transparent", borderWidth: 0 },
    {},
    { flex: 0, height: 12, width: 12 },
  ]);
  expect(rect.props).toMatchObject({
    height: 12,
    rx: 14,
    ry: 14,
    width: 12,
    x: "0",
    y: "0",
  });
});

it("SHOULD render the ListItem preset with a tile and two lines", () => {
  render(<Skeleton.ListItem testID="skeleton-item" />);
  expect(screen.getByTestId("skeleton-item")).toBeTruthy();
  expect(screen.getAllByTestId("skeleton-rect")).toHaveLength(3);
});

it("SHOULD render the Card preset", () => {
  render(<Skeleton.Card testID="skeleton-card" />);
  expect(screen.getByTestId("skeleton-card")).toBeTruthy();
  expect(screen.getAllByTestId("skeleton-rect")).toHaveLength(1);
});
