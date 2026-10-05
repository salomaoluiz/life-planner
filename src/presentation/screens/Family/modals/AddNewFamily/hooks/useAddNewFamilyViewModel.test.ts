import { router } from "expo-router";

import { act, renderHook } from "@tests";

import { GenericError } from "@domain/entities/errors";
import { invalidateFetcherData, useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";

import useAddNewFamilyViewModel from "./useAddNewFamilyViewModel";

jest.mock("expo-router", () => ({ router: { back: jest.fn() } }));
jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    createFamilyUseCase: { execute: jest.fn(), uniqueName: "create_family" },
  },
}));

const mutation = new UseMutationFixture<unknown, void>();

const spies = {
  back: jest.mocked(router.back),
  invalidate: jest.mocked(invalidateFetcherData),
  useMutation: jest.mocked(useMutation),
};

beforeEach(() => {
  jest.clearAllMocks();
});

function setup(
  options: {
    error?: GenericError;
    isFetching?: boolean;
    status?: "idle" | "success";
  } = {},
) {
  mutation.reset().withStatus(options.status ?? "idle");
  if (options.error) {
    mutation.withError(options.error);
  }
  if (options.isFetching) {
    mutation.withIsFetching(true);
  }
  const built = mutation.build();
  spies.useMutation.mockReturnValue(built as never);

  const { result } = renderHook(() => useAddNewFamilyViewModel());

  return { mutate: built.mutate, result };
}

it("SHOULD block an empty or blank name with the required message AND not call the API", () => {
  const { mutate, result } = setup();

  act(() => result.current.onChangeName("   "));
  act(() => result.current.onSubmit());

  expect(result.current.errorKey).toBe("family.form.nameRequired");
  expect(mutate).not.toHaveBeenCalled();
});

it("SHOULD NOT show the error before the first submit", () => {
  expect(setup().result.current.errorKey).toBeUndefined();
});

it("SHOULD send the trimmed name", () => {
  const { mutate, result } = setup();

  act(() => result.current.onChangeName("  Casa Silva  "));
  act(() => result.current.onSubmit());

  expect(mutate).toHaveBeenCalledWith({ name: "Casa Silva" });
});

it("SHOULD cut the name at 50 characters", () => {
  const { result } = setup();

  act(() => result.current.onChangeName("x".repeat(60)));

  expect(result.current.name).toHaveLength(50);
});

it.each([
  [39, false],
  [40, true],
  [50, true],
])("SHOULD show the counter FOR %i characters: %s", (length, visible) => {
  const { result } = setup();

  act(() => result.current.onChangeName("x".repeat(length)));

  expect(result.current.counterVisible).toBe(visible);
});

it("SHOULD close the sheet AND refetch on success", () => {
  setup({ status: "success" });

  expect(spies.back).toHaveBeenCalledTimes(1);
  expect(spies.invalidate).toHaveBeenCalledTimes(1);
});

it("SHOULD close WHEN onClose is called", () => {
  const { result } = setup();

  act(() => result.current.onClose());

  expect(spies.back).toHaveBeenCalledTimes(1);
});

it("SHOULD show a generic error AND stop loading WHEN the creation fails", () => {
  const { result } = setup({ error: new GenericError() });

  expect(result.current.hasGenericError).toBe(true);
  expect(result.current.isSubmitting).toBe(false);
});

it("SHOULD report isSubmitting WHILE the request is pending AND ignore a second submit", () => {
  const { mutate, result } = setup({ isFetching: true });

  act(() => result.current.onChangeName("Casa"));
  act(() => result.current.onSubmit());

  expect(result.current.isSubmitting).toBe(true);
  expect(mutate).not.toHaveBeenCalled();
});
