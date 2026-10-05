import { Alert } from "react-native";

import { renderHook } from "@tests";

import { useCases } from "@application/useCases";
import { BusinessError } from "@domain/entities/errors";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import useFinancialErrorFeedback from "@screens/Financial/hooks/useFinancialErrorFeedback";
import { isWeb } from "@utils/platform";

import useListItem from "../";
import { makeCategoryViewModel } from "../../../../mocks/index.mocks";

jest.mock("@infrastructure/fetcher");
jest.mock("@utils/platform", () => ({ isWeb: jest.fn() }));
jest.mock("@presentation/i18n/useTranslation", () => ({
  __esModule: true,
  default: () => ({ t: (key: string) => key }),
}));
jest.mock("@screens/Financial/hooks/useFinancialErrorFeedback");
jest.mock("@application/useCases", () => ({
  useCases: {
    deleteFinancialCategoryUseCase: {
      execute: jest.fn(),
      uniqueName: "delete_category",
    },
  },
}));

// region mocks
const mutation = new UseMutationFixture<unknown, void>();
const refetch = jest.fn();
const item = makeCategoryViewModel();
const itemWithSubcategories = makeCategoryViewModel({}, true);
// endregion mocks

// region spies
const spies = {
  alert: jest.spyOn(Alert, "alert"),
  confirm: jest.fn(),
  feedback: jest.mocked(useFinancialErrorFeedback),
  isWeb: jest.mocked(isWeb),
  useMutation: jest.mocked(useMutation),
};
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  window.confirm = spies.confirm;
});

function setup(
  status: "error" | "idle" | "success" = "idle",
  options?: {
    error?: BusinessError | null;
    subcategories?: boolean;
    web?: boolean;
  },
) {
  spies.isWeb.mockReturnValue(!!options?.web);
  const built = {
    ...mutation.reset().withStatus(status).build(),
    error: options?.error ?? null,
  };
  spies.useMutation.mockReturnValue(built as never);

  const hook = renderHook(() =>
    useListItem({
      item: options?.subcategories ? itemWithSubcategories : item,
      refetch,
    }),
  );

  return { ...hook, mutate: built.mutate };
}

const mocks = { item, itemWithSubcategories, refetch, useCases };

export { mocks, setup, spies };
