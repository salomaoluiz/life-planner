import React from "react";
import { render } from "@tests";

import CircleSkeleton from "../Circle";

// Mock react-content-loader/native
jest.mock("react-content-loader/native", () => ({
  __esModule: true,
  default: ({ children, height, width, testID, ...props }: any) => (
    <MockedComponent testID={testID} height={height} width={width} {...props}>
      {children}
    </MockedComponent>
  ),
  Circle: ({ cx, cy, r, testID, ...props }: any) => (
    <MockedComponent testID={testID} cx={cx} cy={cy} r={r} {...props} />
  ),
}));

// Mock theme
jest.mock("@presentation/theme", () => ({
  useTheme: () => ({
    theme: {
      colors: {
        onSurface: "#000000",
        onSurfaceVariant: "#666666",
      },
    },
  }),
}));

function MockedComponent(props: any) {
  return <div {...props} />;
}

interface Props {
  size: number;
}

const defaultProps: Props = {
  size: 40,
};

function setup(props?: Partial<Props>) {
  render(<CircleSkeleton {...defaultProps} {...props} />);
}

export { defaultProps, setup };