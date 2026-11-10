import api from "./api";
import investmentDatasource from "./datasource";

it("SHOULD expose the API datasource", () => {
  expect(investmentDatasource()).toBe(api);
});
