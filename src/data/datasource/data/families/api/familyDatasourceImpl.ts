import { FamilyDatasource } from "@data/repositories/repos/family/familyDatasource";

import createFamily from "./createFamily";
import deleteFamily from "./deleteFamily";
import getFamilies from "./getFamilies";
import getFamilyById from "./getFamilyById";
import updateFamily from "./updateFamily";

function familyDatasourceImpl(): FamilyDatasource {
  return {
    createFamily,
    deleteFamily,
    getFamilies,
    getFamilyById,
    updateFamily,
  };
}

export default familyDatasourceImpl;
