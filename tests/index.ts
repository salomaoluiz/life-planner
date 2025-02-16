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

export { renderHook, screen } from "@testing-library/react-native";
export { customRender as render };
