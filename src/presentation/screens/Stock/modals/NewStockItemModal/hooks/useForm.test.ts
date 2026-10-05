import { act, renderHook } from "@testing-library/react-native";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { StockOwners, StockUnits } from "@domain/entities/stock/StockEntity";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import useForm, {
  buildStockParams,
  StockFormValues,
  validateStockForm,
} from "./useForm";

const owners = [
  new OwnerDTO({ id: "user-id", name: "Ana", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-id", name: "Silva", type: OwnerType.FAMILY }),
];

function values(overrides: Partial<StockFormValues> = {}): StockFormValues {
  return {
    barcode: "",
    brand: "",
    description: "Leite",
    notes: "",
    quantity: "1",
    unit: StockUnits.UNIT,
    ...overrides,
  };
}

describe("validateStockForm", () => {
  it("SHOULD require a description", () => {
    expect(validateStockForm(values({ description: "   " }))).toEqual({
      description: "stock.form.descriptionRequired",
    });
  });

  it.each(["", "0", "abc", "-2", "2.5", "1e3"])(
    "SHOULD reject the quantity %p",
    (quantity) => {
      expect(validateStockForm(values({ quantity }))).toEqual({
        quantity: "stock.form.quantityRequired",
      });
    },
  );

  it("SHOULD accept an integer quantity and a description", () => {
    expect(validateStockForm(values({ quantity: "12" }))).toEqual({});
  });
});

describe("buildStockParams", () => {
  it("SHOULD trim and drop empty optional fields", () => {
    const params = buildStockParams(
      values({
        barcode: " ",
        brand: "",
        description: "  Leite ",
        notes: " x ",
      }),
      owners,
      "user-id",
    );

    expect(params.description).toBe("Leite");
    expect(params.brand).toBeUndefined();
    expect(params.barcode).toBeUndefined();
    expect(params.notes).toBe("x");
  });

  it("SHOULD use the default owner and its type", () => {
    const params = buildStockParams(
      values({ quantity: "3" }),
      owners,
      "user-id",
    );

    expect(params).toMatchObject({
      owner: StockOwners.USER,
      ownerId: "user-id",
      quantity: 3,
    });
  });

  it("SHOULD use the chosen family owner and pass dates through", () => {
    const date = new Date(2026, 0, 1);
    const params = buildStockParams(
      values({ expirationDate: date, ownerId: "family-id" }),
      owners,
      "user-id",
    );

    expect(params.owner).toBe(StockOwners.FAMILY);
    expect(params.ownerId).toBe("family-id");
    expect(params.expirationDate).toBe(date);
  });
});

describe("useForm", () => {
  it("SHOULD start with defaults, no errors and not dirty", () => {
    const { result } = renderHook(() => useForm("user-id"));

    expect(result.current.values).toMatchObject({
      ownerId: "user-id",
      quantity: "1",
      unit: "unit",
    });
    expect(result.current.errors).toEqual({});
    expect(result.current.isDirty).toBe(false);
  });

  it("SHOULD show errors after submit and clear them live", () => {
    const { result } = renderHook(() => useForm("user-id"));
    let params: unknown = "x";

    act(() => {
      params = result.current.submit(owners);
    });

    expect(params).toBeUndefined();
    expect(result.current.errors.description).toBe(
      "stock.form.descriptionRequired",
    );

    act(() => {
      result.current.setField("description", "Leite");
    });

    expect(result.current.errors.description).toBeUndefined();
  });

  it("SHOULD return params on a valid submit", () => {
    const { result } = renderHook(() => useForm("user-id"));
    let params: unknown;

    act(() => {
      result.current.setField("description", "Leite");
    });
    act(() => {
      params = result.current.submit(owners);
    });

    expect(params).toMatchObject({ description: "Leite", ownerId: "user-id" });
  });

  it("SHOULD track dirtiness by value", () => {
    const { result } = renderHook(() => useForm("user-id"));

    act(() => {
      result.current.setField("brand", "x");
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.setField("brand", "");
    });
    expect(result.current.isDirty).toBe(false);

    act(() => {
      result.current.setField("ownerId", "family-id");
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.setField("ownerId", "user-id");
    });
    expect(result.current.isDirty).toBe(false);

    act(() => {
      result.current.setField("expirationDate", new Date(2026, 0, 1));
    });
    expect(result.current.isDirty).toBe(true);

    act(() => {
      result.current.setField("expirationDate", undefined);
    });
    expect(result.current.isDirty).toBe(false);
  });
});
