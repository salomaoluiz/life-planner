import { act, renderHook } from "@testing-library/react-native";
import { router, useLocalSearchParams } from "expo-router";

import { modalNavigation } from "@tests/modalNavigation";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { useCases } from "@application/useCases";
import { GenericError } from "@domain/entities/errors";
import { ShoppingListStatuses } from "@domain/entities/stock/ShoppingListEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { invalidateFetcherData, useQuery } from "@infrastructure/fetcher";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";

import useShoppingListViewModel from "./useShoppingListViewModel";

jest.mock("expo-router", () => ({
  router: { replace: jest.fn() },
  useLocalSearchParams: jest.fn(),
}));
jest.mock("@infrastructure/fetcher");
jest.mock("@screens/Financial/hooks/useActiveOwners");
jest.mock("@presentation/i18n", () => ({
  useTranslationLocale: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    createShoppingListUseCase: { execute: jest.fn(), uniqueName: "create" },
    getShoppingListsUseCase: { execute: jest.fn(), uniqueName: "lists" },
    updateShoppingListUseCase: { execute: jest.fn(), uniqueName: "update" },
  },
}));

const owners = [
  new OwnerDTO({ id: "u", name: "Ana", type: OwnerType.USER }),
  new OwnerDTO({ id: "f", name: "Casa", type: OwnerType.FAMILY }),
];
function card(id: string, extra: Record<string, unknown> = {}) {
  return {
    id,
    isDefault: false,
    name: `List ${id}`,
    owner: "FAMILY",
    ownerId: "f",
    purchaseIntervalDays: 7,
    status: ShoppingListStatuses.ACTIVE,
    ...extra,
  };
}
const cards = [
  card("d", { isDefault: true, name: "Mercado" }),
  card("p", { name: "Farmácia" }),
];

function setup(params: Record<string, string> = {}, data: unknown = cards) {
  jest.mocked(useLocalSearchParams).mockReturnValue(params);
  jest.mocked(useActiveOwners).mockReturnValue({ data: owners } as never);
  jest.mocked(useQuery).mockReturnValue({ data, isFetching: false } as never);

  return renderHook(() => useShoppingListViewModel());
}

function statusError(statusCode: number) {
  const error = new GenericError();

  error.addContext({ error: { statusCode } });

  return error;
}

beforeEach(() => {
  jest.clearAllMocks();
});

it("SHOULD start a new list for the person (or the owner of the route) with the default of that owner named", () => {
  const first = setup().result.current;

  expect(first.isEdit).toBe(false);
  expect(first.selectedOwnerId).toBe("u");
  expect(first.defaultListName).toBeUndefined();

  const family = setup({ ownerId: "f" }).result.current;

  expect(family.selectedOwnerId).toBe("f");
  expect(family.defaultListName).toBe("Mercado");
  expect(family.ownerName).toBe("Casa");
});

it("SHOULD create a list with the typed name, the owner and the default switch, then refresh and close", async () => {
  const { result } = setup({ ownerId: "f" });

  act(() => result.current.onNameChange(" Atacado "));
  act(() => result.current.onDefaultChange(true));
  await act(async () => result.current.onSubmit());

  expect(useCases.createShoppingListUseCase.execute).toHaveBeenCalledWith({
    isDefault: true,
    name: "Atacado",
    owner: "FAMILY",
    ownerId: "f",
  });
  expect(invalidateFetcherData).toHaveBeenCalledWith(["lists"]);
  expect(modalNavigation.closeModal).toHaveBeenCalled();
});

it("SHOULD refuse an empty or too long name and show the field error", async () => {
  const { result } = setup();

  await act(async () => result.current.onSubmit());
  expect(result.current.nameError).toBe("stock.lists.nameRequired");
  expect(useCases.createShoppingListUseCase.execute).not.toHaveBeenCalled();

  act(() => result.current.onNameChange("x".repeat(51)));
  await act(async () => result.current.onSubmit());
  expect(result.current.nameError).toBe("stock.lists.nameRequired");
});

it("SHOULD map a 409 to the name-taken message and anything else to the generic error", async () => {
  const { result } = setup();

  act(() => result.current.onNameChange("Mercado"));
  jest
    .mocked(useCases.createShoppingListUseCase.execute)
    .mockRejectedValueOnce(statusError(409));
  await act(async () => result.current.onSubmit());
  expect(result.current.errorKey).toBe("stock.lists.nameTaken");
  expect(result.current.saving).toBe(false);

  jest
    .mocked(useCases.createShoppingListUseCase.execute)
    .mockRejectedValueOnce(new Error("boom"));
  await act(async () => result.current.onSubmit());
  expect(result.current.errorKey).toBe("common.errors.generic");
  expect(modalNavigation.closeModal).not.toHaveBeenCalled();
});

it("SHOULD edit a list sending only what changed (name, default) and read the owner from it", async () => {
  const { result } = setup({ id: "p" });

  expect(result.current.isEdit).toBe(true);
  expect(result.current.currentName).toBe("Farmácia");
  expect(result.current.selectedOwnerId).toBe("f");
  expect(result.current.canArchive).toBe(true);

  act(() => result.current.onNameChange("Farmácia 24h"));
  await act(async () => result.current.onSubmit());
  expect(useCases.updateShoppingListUseCase.execute).toHaveBeenCalledWith({
    id: "p",
    isDefault: undefined,
    name: "Farmácia 24h",
  });

  act(() => result.current.onDefaultChange(true));
  act(() => result.current.onNameChange("Farmácia"));
  await act(async () => result.current.onSubmit());
  expect(useCases.updateShoppingListUseCase.execute).toHaveBeenLastCalledWith({
    id: "p",
    isDefault: true,
    name: undefined,
  });
});

it("SHOULD archive another list, go back to the lists and never archive the default one", async () => {
  const { result } = setup({ id: "p" });

  await act(async () => result.current.onArchive());
  expect(useCases.updateShoppingListUseCase.execute).toHaveBeenCalledWith({
    id: "p",
    status: "ARCHIVED",
  });
  expect(router.replace).toHaveBeenCalledWith("/stock/lists");

  const def = setup({ id: "d" }).result.current;

  expect(def.canArchive).toBe(false);
  expect(def.wasDefault).toBe(true);
  await act(async () => def.onArchive());
  expect(useCases.updateShoppingListUseCase.execute).toHaveBeenCalledTimes(1);
});

it("SHOULD flag a failed archive and keep the sheet open", async () => {
  jest
    .mocked(useCases.updateShoppingListUseCase.execute)
    .mockRejectedValueOnce(new Error("boom"));
  const { result } = setup({ id: "p" });

  await act(async () => result.current.onArchive());

  expect(result.current.errorKey).toBe("common.errors.generic");
  expect(modalNavigation.closeModal).not.toHaveBeenCalled();
});

it("SHOULD read the lists with archived ones and close through the navigation helper", async () => {
  const { result } = setup();
  const options = jest.mocked(useQuery).mock.calls[0][0];

  await options.fetch();
  expect(useCases.getShoppingListsUseCase.execute).toHaveBeenCalledWith({
    includeArchived: true,
  });

  act(() => result.current.onClose());
  act(() => result.current.onOwnerChange("f"));
  expect(modalNavigation.closeModal).toHaveBeenCalled();
  expect(result.current.selectedOwnerId).toBe("f");
});

describe("spec 123 purchase interval", () => {
  const withSuggestion = [
    card("d", { isDefault: true, name: "Mercado" }),
    card("p", {
      name: "Farmácia",
      nextTripDate: new Date(2026, 10, 29),
      suggestedIntervalDays: 9,
    }),
  ];

  it("SHOULD start from the interval of the list AND send it only when it changes", async () => {
    const { result } = setup({ id: "p" }, withSuggestion);

    expect(result.current.currentIntervalText).toBe("7");

    act(() => result.current.onIntervalChange("14"));
    await act(async () => result.current.onSubmit());

    expect(useCases.updateShoppingListUseCase.execute).toHaveBeenCalledWith({
      id: "p",
      isDefault: undefined,
      name: undefined,
      purchaseIntervalDays: 14,
    });
  });

  it.each(["0", "91", "", "abc", "1.5"])(
    "SHOULD refuse %p days and not save",
    async (text) => {
      const { result } = setup({ id: "p" }, withSuggestion);

      act(() => result.current.onIntervalChange(text));
      await act(async () => result.current.onSubmit());

      expect(result.current.intervalError).toBe("stock.lists.intervalInvalid");
      expect(useCases.updateShoppingListUseCase.execute).not.toHaveBeenCalled();
    },
  );

  it("SHOULD offer the suggestion only when it differs AND use it on demand", async () => {
    const { result } = setup({ id: "p" }, withSuggestion);

    expect(result.current.suggestedInterval).toBe(9);

    act(() => result.current.onUseSuggested());

    expect(result.current.currentIntervalText).toBe("9");
    expect(result.current.suggestedInterval).toBeUndefined();
  });

  it("SHOULD not offer a suggestion that does not exist AND expose the next trip", () => {
    const { result } = setup({ id: "d" }, withSuggestion);

    expect(result.current.suggestedInterval).toBeUndefined();
    expect(
      setup({ id: "p" }, withSuggestion).result.current.nextTripDate?.getDate(),
    ).toBe(29);
  });
});
