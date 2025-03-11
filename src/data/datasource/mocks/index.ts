export { datasourcesMocks } from "./listDatasources";

import { listDatasources } from "@data/datasource/data";
import { injectionDatasources } from "@data/datasource";

jest.mock("@data/datasource/data", () => {
  const keys = Object.keys(
    jest.requireActual("@data/datasource/data").listDatasources,
  );
  const cases = keys.reduce((acc, key) => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    acc[key] = jest.fn();
    return acc;
  }, {});

  return { listDatasources: cases };
});

beforeEach(() => {
  jest.clearAllMocks();
});

function injectionDatasourceSetup() {
  return injectionDatasources();
}

const cases = listDatasources;

export { injectionDatasourceSetup, cases };
