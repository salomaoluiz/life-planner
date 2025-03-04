import { listDatasources } from "./index";
import { Datasources } from "@data/datasource";

const useCases: Datasources = {
  userDatasource: expect.any(Function),
  loginDatasource: expect.any(Function),
};

it("SHOULD return a list of use cases", () => {
  expect(listDatasources).toEqual(useCases);
});
