import { Banner } from "react-native-paper";

import { fireEvent, hasText, render, screen } from "@tests";

import { useCases } from "@application/useCases";
import { Accordion, Avatar } from "@components";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import FamilyMemberViewModel from "@screens/Family/models/FamilyMembersViewModel";

import FamilyMemberCard from "../";
import {
  invitedMemberDTO,
  ownerMemberDTO,
  ownerUser,
} from "../../../mocks/index.mocks";

jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    deleteFamilyMemberUseCase: {
      execute: jest.fn(),
      uniqueName: "delete_member",
    },
  },
}));

// region mocks
const mutation = new UseMutationFixture<unknown, void>();
const refetchFamily = jest.fn();
const member = new FamilyMemberViewModel(ownerMemberDTO, ownerUser);
const invitedMember = new FamilyMemberViewModel(invitedMemberDTO);
// endregion mocks

// region spies
const spies = {
  useMutation: jest.mocked(useMutation),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(props?: {
  member?: FamilyMemberViewModel;
  ownerId?: string;
  status?: "error" | "idle" | "success";
}) {
  const built = mutation
    .reset()
    .withStatus(props?.status ?? "idle")
    .build();
  spies.useMutation.mockReturnValue(built as never);

  render(
    <FamilyMemberCard
      member={props?.member ?? member}
      ownerId={props?.ownerId ?? "member-1"}
      refetchFamily={refetchFamily}
    />,
  );

  return { mutate: built.mutate };
}

const mocks = {
  Accordion,
  Avatar,
  Banner,
  invitedMember,
  member,
  refetchFamily,
  useCases,
};

export { mocks, setup, spies };
export { fireEvent, hasText, screen };
