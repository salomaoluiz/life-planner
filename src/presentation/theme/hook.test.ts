import { setup } from "./mocks/hooks";
import { lightTheme } from "./provider";

it("SHOULD return correctly", () => {
  const {
    result: { current },
  } = setup();

  expect(current.isDark).toBeFalsy();
  expect(current.theme).toMatchObject(lightTheme);
  expect(current.setIsDark).toBeInstanceOf(Function);
});
