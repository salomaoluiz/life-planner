import * as reactI18Next from "react-i18next";

import { act, renderHook } from "@tests";

import useTranslation from "./useTranslation";

jest.mock("react-i18next");

const tSpy = jest.fn();

jest
  .spyOn(reactI18Next, "useTranslation")
  .mockReturnValue({ t: tSpy } as never);

function setup() {
  return renderHook(() => useTranslation());
}

it("SHOULD use the t function from i18next", () => {
  const {
    result: { current },
  } = setup();

  act(() => {
    current.t("configurations.configs.darkMode.title", {
      variable: "some-variable",
    });
  });

  expect(tSpy).toHaveBeenCalledTimes(1);
  expect(tSpy).toHaveBeenCalledWith("some-key", { variable: "some-variable" });
});
