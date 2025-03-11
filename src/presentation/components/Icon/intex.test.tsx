import { setup, mocks, screen } from "./mocks/index.mocks";

it("SHOULD render the icon with the correct props", () => {
  setup();

  const component = screen.getByTestId(mocks.defaultProps.testID);

  expect(component.props).toEqual({
    testID: "default-icon",
    source: "google",
    size: 20,
    color: "black",
    children: undefined,
  });
});
