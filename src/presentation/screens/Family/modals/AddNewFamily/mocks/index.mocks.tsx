import { router } from "expo-router";
import { Pressable } from "react-native";

import { fireEvent, render, screen } from "@tests";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";

import AddNewFamilyModal from "../";

jest.mock("expo-router", () => ({ router: { back: jest.fn() } }));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    createFamilyUseCase: { execute: jest.fn(), uniqueName: "create_family" },
  },
}));

// region mocks
const mutation = new UseMutationFixture<unknown, void>();
// endregion mocks

// region spies
const spies = {
  back: jest.mocked(router.back),
  useMutation: jest.mocked(useMutation),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function press(label: string) {
  fireEvent.press(screen.UNSAFE_getAllByProps({ label })[0]);
}

function setup(status: "idle" | "success" = "idle") {
  const built = mutation.reset().withStatus(status).build();
  spies.useMutation.mockReturnValue(built as never);

  render(<AddNewFamilyModal />);

  return { mutate: built.mutate };
}

const mocks = { Pressable, useCases };

export { mocks, press, setup, spies };
export { hasText } from "@tests";
export { fireEvent, screen };
