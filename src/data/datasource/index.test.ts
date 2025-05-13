import { cases, injectionDatasourceSetup } from "./mocks/index.mocks";

it("SHOULD return an object with the datasources", () => {
  const datasources = injectionDatasourceSetup();

  expect(Object.keys(datasources)).toEqual(Object.keys(cases));
});
