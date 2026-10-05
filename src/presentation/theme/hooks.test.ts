import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";

import { setup } from "./mocks/hooks.mocks";
import { lightTheme } from "./provider";

it("SHOULD return correctly", () => {
  const {
    result: { current },
  } = setup();

  expect(current.isDark).toBeFalsy();
  expect(current.theme).toMatchObject(lightTheme);
  expect(current.themeMode).toBe(ThemeMode.SYSTEM);
  expect(current.setThemeMode).toBeInstanceOf(Function);
});
