import { render } from "@tests";

import Skeleton from "../";
import { Props as BoxProps } from "../Box";

// region mocks

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

const setup = {
  box: (props: BoxProps) => render(<Skeleton.Box {...props} />),
  circle: () => render(<Skeleton.Circle size={12} />),
};

const spies = {};

const mocks = {};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
export { screen } from "@tests";
