import { act, renderHook } from "@testing-library/react-native";

import { StockBarcodeInUse } from "@domain/entities/errors";
import { useMutation } from "@infrastructure/fetcher";
import UseMutationFixture from "@infrastructure/fetcher/mocks/useMutation.fixture";
import { dto } from "@screens/Stock/models/stockUi.fixtures";

import useBarcodeField from "./useBarcodeField";

jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: {
    lookupStockBarcodeUseCase: { execute: jest.fn(), uniqueName: "lookup" },
  },
}));

const fixture = new UseMutationFixture<unknown, unknown>();
const setBarcode = jest.fn();

function setup(
  options: Partial<Parameters<typeof useBarcodeField>[0]> = {},
  mutation = fixture.reset().build(),
) {
  jest.mocked(useMutation).mockReturnValue(mutation as never);

  return {
    ...renderHook(() =>
      useBarcodeField({
        ownerId: "user-id",
        saveError: undefined,
        setBarcode,
        ...options,
      }),
    ),
    mutation,
  };
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD open and close the camera", () => {
  const { result } = setup();

  act(() => result.current.onOpen());
  expect(result.current.isScanning).toBe(true);

  act(() => result.current.onClose());
  expect(result.current.isScanning).toBe(false);
});

it("SHOULD put the scanned code in the field, close the camera AND look it up", () => {
  const { mutation, result } = setup();

  act(() => result.current.onOpen());
  act(() => result.current.onScanned(" 7891000-100103 "));

  expect(setBarcode).toHaveBeenCalledWith("7891000100103");
  expect(result.current.isScanning).toBe(false);
  expect(mutation.mutate).toHaveBeenCalledWith({ code: "7891000100103" });
});

it("SHOULD ignore a scanned text that is not a code", () => {
  const { mutation, result } = setup();

  act(() => result.current.onScanned("a$b"));

  expect(setBarcode).not.toHaveBeenCalled();
  expect(mutation.mutate).not.toHaveBeenCalled();
});

describe("in use", () => {
  function match(ownerId: string, id: string) {
    return {
      item: dto((f) => f.withId(id).withDescription("Milk")),
      owner: "USER",
      ownerId,
      ownerName: ownerId,
      readOnly: false,
    };
  }

  it("SHOULD report another item of the same owner with the code", () => {
    const { result } = setup({ itemId: "mine" }, {
      ...fixture.reset().build(),
      data: { code: "1", matches: [match("user-id", "other")] },
    } as never);

    expect(result.current.inUse).toEqual({ description: "Milk" });
  });

  it("SHOULD not count the item being edited NOR another owner", () => {
    const { result } = setup({ itemId: "mine" }, {
      ...fixture.reset().build(),
      data: {
        code: "1",
        matches: [match("user-id", "mine"), match("family-id", "other")],
      },
    } as never);

    expect(result.current.inUse).toBeUndefined();
  });

  it("SHOULD report the 409 answered by the save", () => {
    const { result } = setup({
      saveError: new StockBarcodeInUse("item-9", "Achocolatado"),
    });

    expect(result.current.inUse).toEqual({ description: "Achocolatado" });
  });

  it("SHOULD forget the lookup WHEN the code is typed again", () => {
    const { mutation, result } = setup();

    act(() => result.current.onTyped());

    expect(mutation.reset).toHaveBeenCalled();
  });
});
