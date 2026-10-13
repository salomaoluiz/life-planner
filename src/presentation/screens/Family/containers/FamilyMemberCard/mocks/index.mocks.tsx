import { Banner } from "react-native-paper";

import { fireEvent, hasText, render, screen } from "@tests";

import { useCases } from "@application/useCases";
import { Accordion, Avatar } from "@components";
import {
  FamilyMemberRole,
  FamilyMemberStatus,
} from "@domain/entities/familyMember/FamilyMemberEnums";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import FamilyMemberUIModel, {
  FamilyMemberViewer,
} from "@screens/Family/models/FamilyMemberUIModel";

import FamilyMemberCard from "../";
import { memberDTO } from "../../../mocks/index.mocks";

jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/i18n/useTranslation", () => ({
  __esModule: true,
  default: () => ({ t: (key: string) => key }),
}));
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
const owner: FamilyMemberViewer = { isFamilyOwner: true, userId: "user-1" };
const member: FamilyMemberViewer = { isFamilyOwner: false, userId: "user-2" };

const rows = {
  joined: memberDTO({
    id: "member-3",
    name: "Carol Test",
    photoUrl: undefined,
    role: FamilyMemberRole.MEMBER,
    status: FamilyMemberStatus.JOINED,
    userId: "user-2",
  }),
  owner: memberDTO(),
  pending: memberDTO({
    email: "bob@example.test",
    id: "member-2",
    name: undefined,
    photoUrl: undefined,
    role: FamilyMemberRole.MEMBER,
    status: FamilyMemberStatus.PENDING,
    userId: undefined,
  }),
};
// endregion mocks

// region spies
const spies = { useMutation: jest.mocked(useMutation) };
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(props: {
  isFetching?: boolean;
  row: keyof typeof rows;
  viewer: FamilyMemberViewer;
}) {
  const built = {
    ...mutation.reset().build(),
    isFetching: props.isFetching ?? false,
  };
  spies.useMutation.mockReturnValue(built as never);

  render(
    <FamilyMemberCard
      member={new FamilyMemberUIModel(rows[props.row], props.viewer)}
      refetchFamily={refetchFamily}
    />,
  );

  return { mutate: built.mutate };
}

const mocks = {
  Accordion,
  Avatar,
  Banner,
  member,
  owner,
  useCases,
};

export { mocks, setup, spies };
export { fireEvent, hasText, screen };
