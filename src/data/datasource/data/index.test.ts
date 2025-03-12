import { Datasources } from "@data/datasource";

import { listDatasources } from "./index";

const useCases: Datasources = {
  loginDatasource: expect.any(Function),
  userDatasource: expect.any(Function),
};

it("SHOULD return a list of use cases", () => {
  expect(listDatasources).toEqual(useCases);
});
