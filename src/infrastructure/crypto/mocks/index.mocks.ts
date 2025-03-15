import * as Crypto from "expo-crypto";

import { encode } from "../index";

// region mocks

// endregion mocks

// region spies
const digestStringAsyncSpy = jest
  .spyOn(Crypto, "digestStringAsync")
  .mockResolvedValue("encoded-data");

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(props: Record<string, unknown>) {
  return encode(props);
}

const spies = {
  digestStringAsync: digestStringAsyncSpy,
};

const mocks = {};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
