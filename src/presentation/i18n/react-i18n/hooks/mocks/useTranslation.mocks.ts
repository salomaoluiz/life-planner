import * as reactI18Next from "react-i18next";

import { renderHook } from "@tests";

import useTranslation from "../useTranslation";

// region Mocks
jest.mock("react-i18next");

// endregion Mocks

// region Spies
const tSpy = jest.fn();

jest
  .spyOn(reactI18Next, "useTranslation")
  .mockReturnValue({ t: tSpy } as never);

// endregion Spies

function setup() {
  return renderHook(() => useTranslation());
}

const spies = {
  t: tSpy,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { setup, spies };
export { act } from "@tests";
