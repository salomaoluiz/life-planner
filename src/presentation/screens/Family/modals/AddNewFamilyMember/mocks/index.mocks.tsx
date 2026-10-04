import { router, useLocalSearchParams } from "expo-router";
import { Pressable } from "react-native";

import { fireEvent, render, screen } from "@tests";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import { createFeedbackRouteEncoded } from "@screens/Feedback/BusinessFeedback/utils";

import AddNewFamilyMemberModal from "../";

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    inviteFamilyMemberUseCase: {
      execute: jest.fn(),
      uniqueName: "invite_member",
    },
  },
}));
jest.mock("@screens/Feedback/BusinessFeedback/utils", () => ({
  createFeedbackRouteEncoded: jest.fn(),
}));

// region mocks
const mutation = new UseMutationFixture<unknown, { inviteToken: string }>();
// endregion mocks

// region spies
const spies = {
  back: jest.mocked(router.back),
  encode: jest.mocked(createFeedbackRouteEncoded),
  params: jest.mocked(useLocalSearchParams),
  push: jest.mocked(router.push),
  useMutation: jest.mocked(useMutation),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  spies.params.mockReturnValue({ familyId: "family-1" });
  spies.encode.mockResolvedValue({ feedback: "encoded-feedback" });
});

function press(label: string) {
  fireEvent.press(screen.UNSAFE_getAllByProps({ label })[0]);
}

function setup(props?: { inviteToken?: string }) {
  mutation.reset();
  if (props?.inviteToken) {
    mutation.withData({ inviteToken: props.inviteToken });
  }
  const built = mutation.build();
  spies.useMutation.mockReturnValue(built as never);

  render(<AddNewFamilyMemberModal />);

  return { mutate: built.mutate };
}

const mocks = { Pressable, useCases };

export { mocks, press, setup, spies };
export { hasText } from "@tests";
export { fireEvent, screen };
