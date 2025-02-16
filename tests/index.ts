import React from "react";
import { render } from "@testing-library/react-native";

interface RenderOptions {
  wrapper: React.FunctionComponent;
}
const customRender = (
  component: React.JSX.Element,
  options?: Partial<RenderOptions>,
) => {
  render(component, options);
};

const suppressConsoleError = () => {
  const errorSpy = jest
    .spyOn(global.console, "error")
    .mockImplementation(() => {
      //do nothing
    });

  return () => errorSpy.mockRestore();
};

export {
  renderHook,
  screen,
  act,
  waitFor,
} from "@testing-library/react-native";
export { customRender as render, suppressConsoleError };
