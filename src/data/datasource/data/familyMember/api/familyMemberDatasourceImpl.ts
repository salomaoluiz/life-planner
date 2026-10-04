import { FamilyMemberDatasource } from "@data/repositories/repos/familyMember/familyMemberDatasource";

import deleteFamilyMember from "./deleteFamilyMember";
import getFamilyMembers from "./getFamilyMembers";
import getInvite from "./getInvite";
import inviteFamilyMember from "./inviteFamilyMember";
import joinFamilyMember from "./joinFamilyMember";

function familyMemberDatasourceImpl(): FamilyMemberDatasource {
  return {
    deleteFamilyMember,
    getFamilyMembers,
    getInvite,
    inviteFamilyMember,
    joinFamilyMember,
  };
}

export default familyMemberDatasourceImpl;
