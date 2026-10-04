import { router } from "expo-router";

import { render } from "@tests";

import { useCases } from "@application/useCases";
import { BusinessError, GenericError } from "@domain/entities/errors";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import * as Components from "@screens/Family/components";
import { createFeedbackRouteEncoded } from "@screens/Feedback/BusinessFeedback/utils";

import FamilyCard from "../";
import { makeFamilyViewModel } from "../../../mocks/index.mocks";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/i18n/useTranslation", () => ({
  __esModule: true,
  default: () => ({ t: (key: string) => key }),
}));
jest.mock("@screens/Feedback/BusinessFeedback/utils", () => ({
  createFeedbackRouteEncoded: jest.fn(),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    deleteFamilyUseCase: { execute: jest.fn(), uniqueName: "delete_family" },
  },
}));
jest.mock("@screens/Family/components", () => ({
  FamilyCard: jest.fn(() => null),
}));

// region mocks
const mutation = new UseMutationFixture<unknown, void>();
const refetchFamilies = jest.fn();
// endregion mocks

// region spies
const spies = {
  encode: jest.mocked(createFeedbackRouteEncoded),
  familyCard: jest.mocked(Components.FamilyCard),
  push: jest.mocked(router.push),
  useMutation: jest.mocked(useMutation),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  spies.encode.mockResolvedValue({ feedback: "encoded-feedback" });
});

function setup(
  status: "error" | "idle" | "success" = "idle",
  error: BusinessError | GenericError | null = null,
) {
  const built = { ...mutation.reset().withStatus(status).build(), error };
  spies.useMutation.mockReturnValue(built as never);
  const family = makeFamilyViewModel();

  render(<FamilyCard family={family} refetchFamilies={refetchFamilies} />);

  const props = spies.familyCard.mock.calls[0][0];
  return { family, mutate: built.mutate, props };
}

const mocks = { refetchFamilies, useCases };

export { mocks, setup, spies };
