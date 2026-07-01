import { screen, setup } from "./mocks/index.mocks";

it("SHOULD render children and anchor when visible is true", () => {
  setup({ visible: true });
  expect(screen.getByTestId("anchor")).toBeTruthy();
  expect(screen.getByTestId("child")).toBeTruthy();
});
