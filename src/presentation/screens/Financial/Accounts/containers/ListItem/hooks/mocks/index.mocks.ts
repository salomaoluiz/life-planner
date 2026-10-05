import { router } from "expo-router";
import { Alert } from "react-native";

import { act, renderHook } from "@tests";

import { useCases } from "@application/useCases";
import { BusinessError } from "@domain/entities/errors";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import useFinancialErrorFeedback from "@screens/Financial/hooks/useFinancialErrorFeedback";
import { isWeb } from "@utils/platform";

import useListItem from "../";
import { makeAccountViewModel } from "../../../../mocks/index.mocks";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@infrastructure/fetcher");
jest.mock("@utils/platform", () => ({ isWeb: jest.fn() }));
jest.mock("@screens/Financial/hooks/useFinancialErrorFeedback");
jest.mock("@presentation/i18n/useTranslation", () => ({
  __esModule: true,
  default: () => ({ t: (key: string) => key }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    deleteFinancialAccountUseCase: {
      execute: jest.fn(),
      uniqueName: "delete_account",
    },
  },
}));

// region mocks
const mutation = new UseMutationFixture<unknown, void>();
const refetch = jest.fn();
const item = makeAccountViewModel();
// endregion mocks

// region spies
const spies = {
  alert: jest.spyOn(Alert, "alert"),
  confirm: jest.fn(),
  feedback: jest.mocked(useFinancialErrorFeedback),
  isWeb: jest.mocked(isWeb),
  push: jest.mocked(router.push),
  useMutation: jest.mocked(useMutation),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  window.confirm = spies.confirm;
});

function setup(props?: {
  error?: BusinessError | null;
  status?: "error" | "idle" | "success";
  web?: boolean;
}) {
  spies.isWeb.mockReturnValue(!!props?.web);
  const built = {
    ...mutation
      .reset()
      .withStatus(props?.status ?? "idle")
      .build(),
    error: props?.error ?? null,
  };
  spies.useMutation.mockReturnValue(built as never);

  const hook = renderHook(() => useListItem({ item, refetch }));

  return { ...hook, mutate: built.mutate };
}

const mocks = { item, refetch, useCases };

export { act, mocks, setup, spies };
