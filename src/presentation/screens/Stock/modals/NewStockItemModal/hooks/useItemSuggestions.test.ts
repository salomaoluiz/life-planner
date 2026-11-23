import { act, renderHook } from "@testing-library/react-native";

import { useCases } from "@application/useCases";
import { StockUnits } from "@domain/entities/stock/StockEntity";
import { QuantityMode } from "@domain/entities/stock/stockQuantity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";

import { StockFormValues } from "./useForm";
import useItemSuggestions from "./useItemSuggestions";

jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    getAiUsageUseCase: { execute: jest.fn(), uniqueName: "ai_usage" },
    suggestStockItemUseCase: { execute: jest.fn(), uniqueName: "suggest_item" },
  },
}));

const empty = { mode: QuantityMode.SMALL, text: "" };
const usage = {
  light: { limit: 50, used: 41 },
  search: { limit: 10, used: 8 },
};
const values: StockFormValues = {
  barcode: "",
  brand: "",
  description: "",
  ideal: empty,
  min: empty,
  notes: "",
  openedShelfLifeDays: "",
  quantity: empty,
  step: empty,
  stockOnly: false,
  unit: StockUnits.UNIT,
  warnDaysClosed: "7",
  warnDaysOpened: "1",
};
const mutationFixture = new UseMutationFixture<unknown, unknown>();
const setField = jest.fn();

function answer(
  suggestion: object,
  mutation: ReturnType<typeof setup>["mutation"],
) {
  jest.mocked(useMutation).mockReturnValue({
    ...mutation,
    data: { sources: {}, usage, ...suggestion },
    status: "success",
  } as never);
}

function setup(
  options: Partial<Parameters<typeof useItemSuggestions>[0]> = {},
  usageData: typeof usage | undefined = usage,
  mutation = mutationFixture.reset().build(),
) {
  jest.mocked(useMutation).mockReturnValue(mutation as never);
  jest
    .mocked(useQuery)
    .mockReturnValue({ data: usageData, isFetching: false } as never);

  const hook = renderHook(
    (props: Partial<Parameters<typeof useItemSuggestions>[0]>) =>
      useItemSuggestions({
        enabled: true,
        locale: "en-US",
        owner: "USER",
        ownerId: "user-id",
        setField,
        values,
        ...options,
        ...props,
      }),
    { initialProps: {} },
  );

  return { ...hook, mutation };
}

beforeEach(() => jest.clearAllMocks());

describe("start", () => {
  it("SHOULD ask for the code of the reader ONCE the owner is known", () => {
    const { mutation, rerender } = setup({ barcode: "7891000100103" });

    expect(mutation.mutate).toHaveBeenCalledWith({
      barcode: "7891000100103",
      owner: "USER",
      ownerId: "user-id",
    });

    rerender({ ownerId: "user-id" });

    expect(mutation.mutate).toHaveBeenCalledTimes(1);
  });

  it("SHOULD ask for the typed name of 'Criar com IA'", () => {
    const { mutation } = setup({ autoName: "achocolatado diet" });

    expect(mutation.mutate).toHaveBeenCalledWith({
      name: "achocolatado diet",
      owner: "USER",
      ownerId: "user-id",
    });
  });

  it("SHOULD wait WHEN the owner is not known yet AND ask nothing WHEN editing", () => {
    expect(
      setup({ barcode: "1", ownerId: undefined }).mutation.mutate,
    ).not.toHaveBeenCalled();
    expect(
      setup({ barcode: "1", enabled: false }).mutation.mutate,
    ).not.toHaveBeenCalled();
  });
});

describe("answer", () => {
  it("SHOULD fill the empty fields with their sources AND keep what the user typed", () => {
    const { mutation, rerender, result } = setup({
      barcode: "7891000100103",
      values: { ...values, brand: "Mine" },
    });

    answer(
      {
        fields: {
          brand: "Other",
          categoryId: "cat-1",
          description: "Café",
          openedShelfLifeDays: 30,
          unit: "kilogram",
        },
        sources: {
          brand: "OPEN_FOOD_FACTS",
          categoryId: "AI",
          description: "OPEN_FOOD_FACTS",
          openedShelfLifeDays: "AI",
          unit: "OPEN_FOOD_FACTS",
        },
      },
      mutation,
    );
    rerender({ values: { ...values, brand: "Mine" } });

    expect(setField).toHaveBeenCalledWith("description", "Café");
    expect(setField).toHaveBeenCalledWith("categoryId", "cat-1");
    expect(setField).toHaveBeenCalledWith("openedShelfLifeDays", "30");
    expect(setField).toHaveBeenCalledWith("unit", "kilogram");
    expect(setField).not.toHaveBeenCalledWith("brand", "Other");
    expect(result.current.sources).toEqual({
      categoryId: "AI",
      description: "OPEN_FOOD_FACTS",
      openedShelfLifeDays: "AI",
      unit: "OPEN_FOOD_FACTS",
    });
    expect(result.current.banner).toBe("suggestions");
  });

  it("SHOULD hint the package AND fill the first lot of a kg item", () => {
    const { mutation, rerender, result } = setup({ barcode: "1" });

    answer(
      {
        fields: { packageQuantity: 0.5, unit: "kilogram" },
        sources: {
          packageQuantity: "OPEN_FOOD_FACTS",
          unit: "OPEN_FOOD_FACTS",
        },
      },
      mutation,
    );
    rerender({});

    expect(result.current.packageHint).toEqual({
      text: "500",
      unitKey: "common.units.gram",
    });
    expect(setField).toHaveBeenCalledWith(
      "quantity",
      expect.objectContaining({ text: expect.any(String) }),
    );
  });

  it("SHOULD start a UNIT item from the reader at 1", () => {
    const { mutation, rerender } = setup({ barcode: "1" });

    answer(
      { fields: { description: "Leite" }, sources: { description: "AI" } },
      mutation,
    );
    rerender({});

    expect(setField).toHaveBeenCalledWith("quantity", {
      mode: QuantityMode.SMALL,
      text: "1",
    });
  });

  it.each([
    ["LIMIT_REACHED", "limit"],
    ["AI_UNAVAILABLE", "unavailable"],
    ["AI_NOT_SURE", "notSure"],
  ])("SHOULD show the %s notice as the %s banner", (notice, banner) => {
    const { mutation, rerender, result } = setup({ barcode: "1" });

    answer({ fields: {}, notice }, mutation);
    rerender({});

    expect(result.current.banner).toBe(banner);
  });

  it("SHOULD treat a transport failure like 'unavailable'", () => {
    const { mutation, rerender, result } = setup({ barcode: "1" });

    jest
      .mocked(useMutation)
      .mockReturnValue({ ...mutation, status: "error" } as never);
    rerender({});

    expect(result.current.banner).toBe("unavailable");
  });
});

describe("fill with AI", () => {
  it("SHOULD be allowed from 3 typed characters WITH a search left today", () => {
    expect(
      setup({ values: { ...values, description: "ab" } }).result.current
        .canFillWithAi,
    ).toBe(false);
    expect(
      setup({ values: { ...values, description: "abc" } }).result.current
        .canFillWithAi,
    ).toBe(true);
  });

  it("SHOULD be disabled WHEN the search limit is reached", () => {
    const { result } = setup(
      { values: { ...values, description: "abc" } },
      { ...usage, search: { limit: 10, used: 10 } },
    );

    expect(result.current.canFillWithAi).toBe(false);
    expect(result.current.isLimitReached).toBe(true);
  });

  it("SHOULD ask for the typed name", () => {
    const { mutation, result } = setup({
      values: { ...values, description: " abc " },
    });

    act(() => result.current.onFillWithAi());

    expect(mutation.mutate).toHaveBeenCalledWith({
      name: "abc",
      owner: "USER",
      ownerId: "user-id",
    });
  });
});

describe("skip and edit", () => {
  it("SHOULD ignore the answer after 'Preencher sozinho'", () => {
    const { mutation, rerender, result } = setup({ barcode: "1" });

    act(() => result.current.onSkip());
    answer(
      { fields: { description: "Late" }, sources: { description: "AI" } },
      mutation,
    );
    rerender({});

    expect(mutation.reset).toHaveBeenCalled();
    expect(setField).not.toHaveBeenCalled();
  });

  it("SHOULD drop the badge of a field the user edits", () => {
    const { mutation, rerender, result } = setup({ barcode: "1" });

    answer(
      { fields: { description: "Leite" }, sources: { description: "AI" } },
      mutation,
    );
    rerender({});
    expect(result.current.sources.description).toBe("AI");

    act(() => result.current.clearSource("description"));

    expect(result.current.sources.description).toBeUndefined();
  });
});

describe("failing calls never break the form", () => {
  it("SHOULD turn a failed suggestion call into 'unavailable'", async () => {
    jest
      .mocked(useCases.suggestStockItemUseCase.execute)
      .mockRejectedValue(new Error("500"));
    setup();

    const { fetch } = jest.mocked(useMutation).mock.calls[0][0] as {
      fetch: (params: unknown) => Promise<{ notice: string }>;
    };

    expect((await fetch({})).notice).toBe("AI_UNAVAILABLE");
  });

  it("SHOULD turn a failed usage read into 'unknown' usage", async () => {
    jest
      .mocked(useCases.getAiUsageUseCase.execute)
      .mockRejectedValue(new Error("500"));
    setup();

    const { fetch } = jest.mocked(useQuery).mock.calls[0][0] as {
      fetch: () => Promise<{ search: { limit: number } }>;
    };

    expect((await fetch()).search.limit).toBe(0);
  });
});
