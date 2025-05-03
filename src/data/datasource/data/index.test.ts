import { Datasources } from "@data/datasource";

import { listDatasources } from "./index";

const useCases: Datasources = {
  familyDatasource: expect.any(Function),
  familyMemberDatasource: expect.any(Function),
  financialTransactionDatasource: expect.any(Function),
  loginDatasource: expect.any(Function),
  stockDatasource: expect.any(Function),
  userDatasource: expect.any(Function),
};

it("SHOULD return a list of use cases", () => {
  expect(listDatasources).toEqual(useCases);
});
