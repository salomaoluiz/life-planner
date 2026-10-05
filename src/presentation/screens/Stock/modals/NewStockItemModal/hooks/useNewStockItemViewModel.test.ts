import { act, renderHook } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import useNewStockItemViewModel from "./useNewStockItemViewModel";

jest.mock("expo-router", () => ({
  router: { back: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    createStockItemUseCase: { execute: jest.fn(), uniqueName: "create_stock" },
    getOwnersUseCase: { execute: jest.fn(), uniqueName: "get_owners" },
  },
}));

const owners = [
  new OwnerDTO({ id: "user-id", name: "Ana", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-id", name: "Silva", type: OwnerType.FAMILY }),
];
const ownersQuery = new UseQueryFixture<OwnerDTO[]>();
const mutation = new UseMutationFixture<unknown, void>();
let mutate = jest.fn();

function setup(
  options: {
    fetching?: boolean;
    mutationFetching?: boolean;
    noOwners?: boolean;
    ownerId?: string;
    status?: "error" | "idle" | "success";
  } = {},
) {
  ownersQuery.reset().withIsFetching(!!options.fetching);
  if (!options.noOwners) {
    ownersQuery.withData(owners);
  }
  const built = mutation
    .reset()
    .withStatus(options.status ?? "idle")
    .withIsFetching(!!options.mutationFetching)
    .build();
  mutate = built.mutate as jest.Mock;
  jest.mocked(useQuery).mockReturnValue(ownersQuery.build() as never);
  jest.mocked(useMutation).mockReturnValue(built as never);
  jest
    .mocked(useLocalSearchParams)
    .mockReturnValue({ ownerId: options.ownerId } as never);

  return renderHook(() => useNewStockItemViewModel());
}

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD be loading while the owners fetch", () => {
  const { result } = setup({ fetching: true, noOwners: true });

  expect(result.current.isLoading).toBe(true);
  expect(result.current.model).toBeUndefined();
});

it("SHOULD build the model with the default owner from the param", () => {
  const { result } = setup({ ownerId: "family-id" });

  expect(result.current.isLoading).toBe(false);
  expect(result.current.model?.defaultOwnerId).toBe("family-id");
  expect(result.current.values.ownerId).toBe("family-id");
});

it("SHOULD NOT mutate and expose errors WHEN the form is invalid", () => {
  const { result } = setup();

  act(() => {
    result.current.onSave();
  });

  expect(mutate).not.toHaveBeenCalled();
  expect(result.current.errors.description).toBe(
    "stock.form.descriptionRequired",
  );
});

it("SHOULD mutate once WHEN valid and ignore saves while fetching", () => {
  const { result } = setup();

  act(() => {
    result.current.setField("description", "Leite");
  });
  act(() => {
    result.current.onSave();
  });

  expect(mutate).toHaveBeenCalledTimes(1);
  expect(mutate).toHaveBeenCalledWith(
    expect.objectContaining({ description: "Leite", ownerId: "user-id" }),
  );

  const busy = setup({ mutationFetching: true });
  act(() => {
    busy.result.current.setField("description", "Leite");
  });
  act(() => {
    busy.result.current.onSave();
  });

  expect(mutate).not.toHaveBeenCalled();
  expect(busy.result.current.isSaving).toBe(true);
});

it("SHOULD go back WHEN the mutation succeeds", () => {
  setup({ status: "success" });

  expect(router.back).toHaveBeenCalledTimes(1);
});

it("SHOULD expose the generic error and keep values WHEN the mutation fails", () => {
  const { result } = setup({ status: "error" });

  expect(result.current.formErrorKey).toBe("common.errors.generic");
  expect(result.current.values.description).toBe("");
});

it("SHOULD go back WHEN closing a clean form", () => {
  const { result } = setup();

  act(() => {
    result.current.onClose();
  });

  expect(router.back).toHaveBeenCalledTimes(1);
  expect(result.current.isDiscardOpen).toBe(false);
});

it("SHOULD ask to discard WHEN closing a dirty form, then keep or discard", () => {
  const { result } = setup();

  act(() => {
    result.current.setField("brand", "x");
  });
  act(() => {
    result.current.onClose();
  });

  expect(result.current.isDiscardOpen).toBe(true);
  expect(router.back).not.toHaveBeenCalled();

  act(() => {
    result.current.onKeepEditing();
  });
  expect(result.current.isDiscardOpen).toBe(false);

  act(() => {
    result.current.onDiscard();
  });
  expect(router.back).toHaveBeenCalledTimes(1);
});

it("SHOULD toggle the more details section", () => {
  const { result } = setup();

  expect(result.current.isMoreOpen).toBe(false);

  act(() => {
    result.current.onToggleMore();
  });
  expect(result.current.isMoreOpen).toBe(true);
});
