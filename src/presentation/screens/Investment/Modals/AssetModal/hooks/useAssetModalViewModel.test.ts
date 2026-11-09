import { useLocalSearchParams } from "expo-router";

import { act, renderHook } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { TickerExists } from "@domain/entities/errors";
import { InvestmentAssetClass } from "@domain/entities/investment/enums";
import { InvestmentAssetDetail } from "@domain/entities/investment/InvestmentEntities";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import useOwners from "@presentation/hooks/useOwners";
import useActiveOwners from "@screens/Financial/hooks/useActiveOwners";
import invalidateInvestments from "@screens/Investment/hooks/invalidateInvestments";
import { makeDetail, owners } from "@screens/Investment/mocks/fixtures";

import useAssetModalViewModel from "./useAssetModalViewModel";

jest.mock("expo-router", () => ({ useLocalSearchParams: jest.fn() }));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/hooks/useOwners");
jest.mock("@screens/Financial/hooks/useActiveOwners");
jest.mock("@screens/Investment/hooks/invalidateInvestments");
jest.mock("@application/useCases", () => ({
  useCases: {
    createInvestmentAssetUseCase: { execute: jest.fn(), uniqueName: "create" },
    getInvestmentAssetUseCase: { execute: jest.fn(), uniqueName: "get" },
    updateInvestmentAssetUseCase: { execute: jest.fn(), uniqueName: "update" },
  },
}));

const detailQuery = new UseQueryFixture<InvestmentAssetDetail>();
const ownersQuery = new UseQueryFixture<OwnerDTO[]>();
const createMutation = new UseMutationFixture();
const updateMutation = new UseMutationFixture();

const spies = {
  activeOwners: jest.mocked(useActiveOwners),
  allOwners: jest.mocked(useOwners),
  params: jest.mocked(useLocalSearchParams),
  useMutation: jest.mocked(useMutation),
  useQuery: jest.mocked(useQuery),
};

beforeEach(() => {
  jest.clearAllMocks();
  detailQuery.reset();
  ownersQuery.reset().withData(owners);
  createMutation.reset();
  updateMutation.reset();
  spies.params.mockReturnValue({});
  spies.activeOwners.mockReturnValue(ownersQuery.build() as never);
  spies.allOwners.mockReturnValue(ownersQuery.build() as never);
  spies.useQuery.mockImplementation((() => detailQuery.build()) as never);
  spies.useMutation.mockImplementation(((props: { cacheKey: string[] }) =>
    (props.cacheKey[0] === "create"
      ? createMutation
      : updateMutation
    ).build()) as never);
});

function setup() {
  return renderHook(() => useAssetModalViewModel());
}

it("SHOULD start a new asset for the personal owner", () => {
  const { result } = setup();

  expect(result.current.isEditing).toBe(false);
  expect(result.current.ownerId).toBe("user-1");
  expect(result.current.assetClass).toBe(InvestmentAssetClass.BR_STOCK);
  expect(result.current.classOptions).toHaveLength(5);
  expect(result.current.titleKey).toBe("investment.form.asset.newTitle");
});

it("SHOULD be loading until the owners arrive", () => {
  ownersQuery.reset();
  spies.activeOwners.mockReturnValue(ownersQuery.build() as never);

  expect(setup().result.current.isLoading).toBe(true);
});

it("SHOULD validate before creating AND create with the typed values", () => {
  const { result } = setup();

  act(() => result.current.onSave());
  expect(result.current.nameError).toBeDefined();
  expect(createMutation.value.mutate).not.toHaveBeenCalled();

  act(() => result.current.onTickerChange("itsa4"));
  act(() => result.current.onCurrentValueChange("10,53"));
  act(() => result.current.onSave());

  expect(createMutation.value.mutate).toHaveBeenCalledWith(
    expect.objectContaining({
      assetClass: "BR_STOCK",
      currentUnitPrice: "10,53",
      name: "ITSA4",
      owner: "USER",
      ticker: "ITSA4",
    }),
  );
});

it("SHOULD suggest the currency by class AND let the user pick one", () => {
  const { result } = setup();

  act(() => result.current.onAssetClassChange("FOREIGN_STOCK"));
  expect(result.current.currency).toBe("USD");

  act(() => result.current.onCurrencyChange("EUR"));
  act(() => result.current.onAssetClassChange("BR_STOCK"));
  expect(result.current.currency).toBe("EUR");
  expect(result.current.currencyOptions).toEqual(["BRL", "USD", "EUR"]);
});

it("SHOULD change the name and owner", () => {
  const { result } = setup();

  act(() => result.current.onNameChange("Itaúsa"));
  act(() => result.current.onOwnerChange("fam-1"));

  expect(result.current.name).toBe("Itaúsa");
  expect(result.current.ownerId).toBe("fam-1");
});

it("SHOULD close, invalidate and reset WHEN the create succeeds", () => {
  createMutation.withStatus("success");

  setup();

  expect(invalidateInvestments).toHaveBeenCalled();
  expect(modalNavigation.closeModal).toHaveBeenCalled();
});

it("SHOULD show the duplicated ticker under the ticker field", () => {
  createMutation.withError(new TickerExists() as never);

  const { result } = setup();

  expect(result.current.tickerError).toBe("investment.errors.tickerExists");
  expect(result.current.failure).toBeUndefined();
});

it("SHOULD show other failures at the end of the form", () => {
  updateMutation.withError();

  expect(setup().result.current.failure?.key).toBe("common.errors.generic");
});

describe("editing", () => {
  beforeEach(() => {
    spies.params.mockReturnValue({ id: "asset-1" });
    detailQuery.withData(makeDetail());
  });

  it("SHOULD load the asset AND lock class and currency after the first operation", () => {
    const { result } = setup();

    expect(result.current.isEditing).toBe(true);
    expect(result.current.ticker).toBe("ITSA4");
    expect(result.current.classLocked).toBe(true);
    expect(result.current.titleKey).toBe("investment.form.asset.editTitle");
  });

  it("SHOULD send only the changes AND close without a request WHEN nothing changed", () => {
    const { result } = setup();

    act(() => result.current.onSave());
    expect(updateMutation.value.mutate).not.toHaveBeenCalled();
    expect(modalNavigation.closeModal).toHaveBeenCalled();

    act(() => result.current.onNameChange("Itaúsa ON"));
    act(() => result.current.onSave());
    expect(updateMutation.value.mutate).toHaveBeenCalledWith({
      id: "asset-1",
      name: "Itaúsa ON",
    });
  });

  it("SHOULD report a missing asset", () => {
    detailQuery.reset().withError();

    expect(setup().result.current.isNotFound).toBe(true);
  });

  it("SHOULD ask before discarding a dirty form", () => {
    const { result } = setup();

    act(() => result.current.onClose());
    expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);

    act(() => result.current.onNameChange("Changed"));
    act(() => result.current.onClose());
    expect(result.current.discardOpen).toBe(true);

    act(() => result.current.onDiscardCancel());
    expect(result.current.discardOpen).toBe(false);
    act(() => result.current.onDiscardConfirm());
    expect(modalNavigation.closeModal).toHaveBeenCalledTimes(2);
  });

  it("SHOULD NOT lock the class WHEN the asset has no operation", () => {
    detailQuery.withData(makeDetail({ operationCount: 0 }));

    expect(setup().result.current.classLocked).toBe(false);
  });
});
