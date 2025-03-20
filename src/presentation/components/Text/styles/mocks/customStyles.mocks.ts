import customStyles, { CustomStyles } from "../customStyles";

// region mocks
const defaultProps = {} as CustomStyles;
const partialProps = {
  color: "red",
} as CustomStyles;
const fullProps: Required<CustomStyles> = {
  color: "red",
  textAlign: "center",
};
// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(props?: Partial<CustomStyles>) {
  return customStyles({ ...defaultProps, ...props });
}

const spies = {};

const mocks = {
  defaultProps,
  fullProps,
  partialProps,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
