import { difference } from "../difference";

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(...params: Parameters<typeof difference>) {
  return difference(...params);
}

export { setup };
