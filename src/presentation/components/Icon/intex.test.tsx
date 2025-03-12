import { mocks, screen, setup } from "./mocks/index.mocks";

it("SHOULD render the icon with the correct props", () => {
  setup();

  const component = screen.getByTestId(mocks.defaultProps.testID);

  expect(component.props).toEqual({
    children: undefined,
    color: "black",
    size: 20,
    source: "google",
    testID: "default-icon",
  });
});
