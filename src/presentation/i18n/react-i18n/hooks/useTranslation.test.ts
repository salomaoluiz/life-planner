import { act, setup, spies } from "./mocks/useTranslation.mocks";

it("SHOULD use the t function from i18next", () => {
  const {
    result: { current },
  } = setup();

  act(() => {
    current.t("configurations.configs.theme.title", {
      variable: "some-variable",
    });
  });

  expect(spies.t).toHaveBeenCalledTimes(1);
  expect(spies.t).toHaveBeenCalledWith("configurations.configs.theme.title", {
    variable: "some-variable",
  });
});
