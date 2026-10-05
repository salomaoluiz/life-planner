import "@shopify/flash-list/jestSetup";

import { render } from "@tests";

import FamilyInviteDTO from "@application/dto/familyMember/FamilyInviteDTO";

import Invite from "../";
import useInviteViewModel from "../hooks/useInviteViewModel";
import InviteUIModel from "../models/InviteUIModel";

jest.mock("../hooks/useInviteViewModel");
jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);
jest.mock("@presentation/i18n/useTranslation", () => ({
  __esModule: true,
  default: () => ({
    t: (key: string, params?: object) =>
      params ? `${key} ${JSON.stringify(params)}` : key,
  }),
}));

// region mocks
function invite(emailMatches: boolean) {
  return new InviteUIModel(
    new FamilyInviteDTO({
      email: "bob@example.test",
      emailMatches,
      familyId: "family-1",
      familyName: "Test Family",
      inviteExpiresAt: new Date("2026-10-11T12:00:00.000Z"),
    }),
  );
}

const base = {
  acceptErrorKey: undefined as string | undefined,
  invite: undefined as InviteUIModel | undefined,
  isAccepting: false,
  onAccept: jest.fn(),
  onDecline: jest.fn(),
  onGoHome: jest.fn(),
  onRetry: jest.fn(),
  status: "ready" as "error" | "expired" | "loading" | "notFound" | "ready",
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(overrides?: Partial<typeof base> & { matches?: boolean }) {
  const { matches = true, ...rest } = overrides ?? {};
  const vm = { ...base, invite: invite(matches), ...rest };
  jest.mocked(useInviteViewModel).mockReturnValue(vm as never);

  render(<Invite />);

  return vm;
}

export { setup };
export { fireEvent, hasText, screen } from "@tests";
