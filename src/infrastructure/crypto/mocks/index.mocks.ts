import { decode, encode } from "../index";

// region mocks

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

const setup = {
  decode: async (encodedData: string) => decode(encodedData),
  encode: async (props: Record<string, unknown>) => encode(props),
};

const spies = {};

const mocks = {};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
