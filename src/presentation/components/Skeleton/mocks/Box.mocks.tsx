import React from "react";
import { render } from "@tests";

import BoxSkeleton, { Props } from "../Box";

// Mock react-content-loader/native
jest.mock("react-content-loader/native", () => ({
  __esModule: true,
  default: ({ children, height, width, testID, ...props }: any) => (
    <MockedComponent testID={testID} height={height} width={width} {...props}>
      {children}
    </MockedComponent>
  ),
  Rect: ({ height, width, rx, ry, testID, ...props }: any) => (
    <MockedComponent
      testID={testID}
      height={height}
      width={width}
      rx={rx}
      ry={ry}
      {...props}
    />
  ),
}));

// Mock utils
jest.mock("../utils", () => ({
  getSize: jest.fn((value: any) => parseInt(value.toString())),
}));

// Mock theme
jest.mock("@presentation/theme", () => ({
  useTheme: () => ({
    theme: {
      colors: {
        onSurface: "#000000",
        onSurfaceVariant: "#666666",
      },
      sizes: {
        borderRadius: {
          medium: 8,
        },
      },
    },
  }),
}));

function MockedComponent(props: any) {
  return <div {...props} />;
}

const defaultProps: Props = {
  height: 50,
  width: 100,
};

function setup(props?: Partial<Props>) {
  render(<BoxSkeleton {...defaultProps} {...props} />);
}

export { defaultProps, setup };