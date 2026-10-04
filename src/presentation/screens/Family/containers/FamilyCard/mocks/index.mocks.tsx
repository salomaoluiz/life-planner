import { router } from "expo-router";

import { render } from "@tests";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import * as Components from "@screens/Family/components";

import FamilyCard from "../";
import { makeFamilyViewModel } from "../../../mocks/index.mocks";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@infrastructure/fetcher");
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
  familyCard: jest.mocked(Components.FamilyCard),
  push: jest.mocked(router.push),
  useMutation: jest.mocked(useMutation),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(status: "error" | "idle" | "success" = "idle") {
  const built = mutation.reset().withStatus(status).build();
  spies.useMutation.mockReturnValue(built as never);
  const family = makeFamilyViewModel();

  render(<FamilyCard family={family} refetchFamilies={refetchFamilies} />);

  const props = spies.familyCard.mock.calls[0][0];
  return { family, mutate: built.mutate, props };
}

const mocks = { refetchFamilies, useCases };

export { mocks, setup, spies };
