import { datasourcesMocks } from "@data/datasource/mocks/listDatasources.mocks";

import * as createFamily from "../createFamily";
import * as deleteFamily from "../deleteFamily";
import familyRepositoryImpl from "../familyRepositoryImpl";
import * as getFamilies from "../getFamilies";
import * as getFamilyById from "../getFamilyById";
import * as updateFamily from "../updateFamily";

// region mocks

// endregion mocks

// region spies

const createFamilySpy = jest.spyOn(createFamily, "default");
createFamilySpy.mockResolvedValue("createFamily response" as never);

const deleteFamilySpy = jest.spyOn(deleteFamily, "default");
deleteFamilySpy.mockResolvedValue("deleteFamily response" as never);

const getFamiliesSpy = jest.spyOn(getFamilies, "default");
getFamiliesSpy.mockResolvedValue("getFamilies response" as never);

const getFamilyByIdSpy = jest.spyOn(getFamilyById, "default");
getFamilyByIdSpy.mockResolvedValue("getFamilyById response" as never);

const updateFamilySpy = jest.spyOn(updateFamily, "default");
updateFamilySpy.mockResolvedValue("updateFamily response" as never);

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  return familyRepositoryImpl(datasourcesMocks);
}

const spies = {
  createFamily: createFamilySpy,
  deleteFamily: deleteFamilySpy,
  getFamilies: getFamiliesSpy,
  getFamilyById: getFamilyByIdSpy,
  updateFamily: updateFamilySpy,
};

const mocks = {
  datasources: datasourcesMocks,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
