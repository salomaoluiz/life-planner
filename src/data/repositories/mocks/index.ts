import { datasourcesMocks } from "@data/datasource/mocks";

export { repositoriesMocks } from "./listRepositories";

import { injectionRepository } from "@data/repositories";
import { listRepositories } from "@data/repositories/repos";

jest.mock("@data/repositories/repos", () => {
  const keys = Object.keys(
    jest.requireActual("@data/repositories/repos").listRepositories,
  );
  const cases = keys.reduce((acc, key) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    acc[key] = jest.fn();
    return acc;
  }, {});

  return { listRepositories: cases };
});

beforeEach(() => {
  jest.clearAllMocks();
});

function injectionRepositorySetup() {
  return injectionRepository({ dataSources: datasourcesMocks });
}

const cases = listRepositories;

export { cases, datasourcesMocks, injectionRepositorySetup };
