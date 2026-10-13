import { useIsFocused } from "@react-navigation/native";

import { renderHook } from "@tests";

import UserDTO from "@application/dto/user/UserDTO";
import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import FamilyViewModel from "@screens/Family/models/FamilyViewModel";

import {
  familyDTO,
  invitedMemberDTO,
  ownerMemberDTO,
  ownerUser,
} from "../../mocks/index.mocks";
import useFamilies from "../useFamilies";

jest.mock("@react-navigation/native", () => ({ useIsFocused: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    getFamiliesUseCase: { execute: jest.fn(), uniqueName: "families" },
    getFamilyMembersUseCase: { execute: jest.fn(), uniqueName: "members" },
    getUserUseCase: { execute: jest.fn(), uniqueName: "user" },
  },
}));

// region mocks
const query = new UseQueryFixture<FamilyViewModel[]>();
// endregion mocks

// region spies
const spies = {
  getFamilies: jest.mocked(useCases.getFamiliesUseCase.execute),
  getMembers: jest.mocked(useCases.getFamilyMembersUseCase.execute),
  getUser: jest.mocked(useCases.getUserUseCase.execute),
  isFocused: jest.mocked(useIsFocused),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function givenData() {
  spies.getUser.mockResolvedValue(ownerUser as UserDTO);
  spies.getFamilies.mockResolvedValue([familyDTO]);
  spies.getMembers.mockResolvedValue([ownerMemberDTO, invitedMemberDTO]);
}

function setup(props?: { focused?: boolean }) {
  spies.isFocused.mockReturnValue(!!props?.focused);
  const built = query.reset().build();
  spies.useQuery.mockReturnValue(built as never);

  const hook = renderHook(() => useFamilies());

  return { ...hook, refetch: built.refetch };
}

const mocks = { query };

export { givenData, mocks, setup, spies };
