import { injectionUseCases } from "@application/useCases";
import { listUseCases } from "@application/useCases/cases";
import Repositories from "@domain/repositories";

jest.mock("@data/repositories", () => ({
  repositories: jest.requireActual("@data/repositories/mocks/index.mocks")
    .repositoriesMocks,
}));

jest.mock("@application/useCases/cases", () => {
  const keys = Object.keys(
    jest.requireActual("@application/useCases/cases").listUseCases,
  );
  const cases = keys.reduce((acc, key) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    acc[key] = jest.fn().mockReturnValue({ execute: jest.fn() });
    return acc;
  }, {});

  return { listUseCases: cases };
});

const repositories = {
  loginRepository: {},
  userRepository: {},
} as Repositories;

beforeEach(() => {
  jest.clearAllMocks();
});

function injectionUseCaseSetup() {
  return injectionUseCases({ repositories });
}

const cases = listUseCases;

export { cases, injectionUseCaseSetup, repositories };
