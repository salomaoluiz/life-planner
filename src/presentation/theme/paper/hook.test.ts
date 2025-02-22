import { renderHook } from "@tests";
import usePaperTheme from "./hook";
import * as paper from "react-native-paper";

const theme = {
  colors: {
    primary: "blue",
  },
};
const useThemeSpy = jest.spyOn(paper, "useTheme").mockReturnValue(theme);

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD return the theme correctly", () => {
  const {
    result: { current },
  } = renderHook(usePaperTheme);

  expect(current).toEqual(theme);
});

it("SHOULD call useTheme from react-native-paper with the correct params", () => {
  renderHook(usePaperTheme);

  expect(useThemeSpy).toHaveBeenCalledTimes(1);
  expect(useThemeSpy).toHaveBeenCalledWith();
});
