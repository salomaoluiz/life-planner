import { router, useLocalSearchParams } from "expo-router";

import { render } from "@tests";

import FamilyDTO from "@application/dto/family/FamilyDTO";
import UserDTO from "@application/dto/user/UserDTO";
import { useCases } from "@application/useCases";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import Invite from "../";
import FamilyViewModel from "../models/FamilyViewModel";
import { RouteProps } from "../types";
import { decodeRouteParams } from "../utils";

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("../utils", () => ({ decodeRouteParams: jest.fn() }));
jest.mock("@application/useCases", () => ({
  useCases: {
    getFamilyByIdUseCase: { execute: jest.fn(), uniqueName: "get_family" },
    getUserUseCase: { execute: jest.fn(), uniqueName: "get_user" },
    joinFamilyMemberUseCase: { execute: jest.fn(), uniqueName: "join_family" },
  },
}));

// region mocks
const familyDTO = new FamilyDTO({
  id: "family-1",
  name: "Test Family",
  ownerId: "user-1",
});
const userDTO = new UserDTO({
  email: "bob@example.test",
  id: "user-2",
  name: "Bob Test",
  photoUrl: "",
});
const routeProps: RouteProps = {
  email: "bob@example.test",
  familyId: "family-1",
  inviteDate: new Date("2025-01-01T00:00:00Z"),
};

const query = new UseQueryFixture<FamilyViewModel | undefined>();
const joinMutation = new UseMutationFixture<unknown, void>();
// endregion mocks

// region spies
const spies = {
  decode: jest.mocked(decodeRouteParams),
  getFamily: jest.mocked(useCases.getFamilyByIdUseCase.execute),
  getUser: jest.mocked(useCases.getUserUseCase.execute),
  params: jest.mocked(useLocalSearchParams),
  replace: jest.mocked(router.replace),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  spies.params.mockReturnValue({ token: "invite-token" });
});

function setup(props?: {
  email?: string;
  loaded?: boolean;
  status?: "idle" | "success";
}) {
  query.reset();
  if (props?.loaded !== false) {
    query.withData(
      new FamilyViewModel(familyDTO, userDTO, {
        ...routeProps,
        email: props?.email ?? routeProps.email,
      }),
    );
  }
  const builtJoin = joinMutation
    .reset()
    .withStatus(props?.status ?? "idle")
    .build();
  spies.useQuery.mockReturnValue(query.build() as never);
  spies.useMutation.mockReturnValue(builtJoin as never);

  render(<Invite />);

  return { mutate: builtJoin.mutate };
}

const mocks = { familyDTO, routeProps, useCases, userDTO };

export { mocks, setup, spies };
export { fireEvent, hasText, screen } from "@tests";
