import { renderHook } from "@tests";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import useFilterOptions from "./useFilterOptions";
import useImportRecords from "./useImportRecords";

jest.mock("./useFilterOptions");

function category(
  id: string,
  name: string,
  extra: Partial<ConstructorParameters<typeof CategoryDTO>[0]> = {},
) {
  return new CategoryDTO({
    icon: "cart",
    id,
    name,
    owner: "USER",
    ownerId: "u1",
    type: "EXPENSE",
    ...extra,
  });
}

const owners = [
  new OwnerDTO({ id: "u1", name: "Me", type: OwnerType.USER }),
  new OwnerDTO({ id: "f1", name: "Família", type: OwnerType.FAMILY }),
];

beforeEach(() => {
  jest.mocked(useFilterOptions).mockReturnValue({
    categories: [],
    categoryDtos: [
      category("home", "Casa"),
      category("market", "Mercado", { parentId: "home" }),
      category("old", "Antiga", { status: "ARCHIVED" }),
      category("fam", "Escola", { ownerId: "f1", scopeOwnerIds: ["f1"] }),
    ],
    sources: [
      {
        archived: false,
        currency: "BRL",
        id: "a1",
        kind: "ACCOUNT",
        name: "Corrente",
        ownerId: "u1",
      },
      {
        archived: true,
        currency: "BRL",
        id: "a2",
        kind: "ACCOUNT",
        name: "Velha",
        ownerId: "u1",
      },
      {
        archived: false,
        currency: "BRL",
        id: "a3",
        kind: "ACCOUNT",
        name: "Da família",
        ownerId: "f1",
      },
      {
        archived: false,
        closingDay: 5,
        currency: "BRL",
        id: "c1",
        kind: "CARD",
        name: "Visa",
        ownerId: "u1",
      },
    ],
    tags: [],
  } as never);
});

describe("useImportRecords", () => {
  it("SHOULD list the active accounts, cards and categories of each owner, with category paths", () => {
    const { result } = renderHook(() => useImportRecords(owners));

    expect(result.current.u1.accounts).toEqual([
      { currency: "BRL", id: "a1", name: "Corrente" },
    ]);
    expect(result.current.u1.cards).toEqual([
      { closingDay: 5, currency: "BRL", id: "c1", name: "Visa" },
    ]);
    expect(
      result.current.u1.categories.map((item) => [item.id, item.path]),
    ).toEqual([
      ["home", "Casa"],
      ["market", "Casa > Mercado"],
    ]);
    expect(result.current.u1.categories[1]).toMatchObject({
      iconColor: expect.any(String),
      parentId: "home",
    });
    expect(result.current.u1.categories[0]).toMatchObject({
      depthLevel: 0,
      type: "EXPENSE",
    });
  });

  it("SHOULD keep the records of another owner apart", () => {
    const { result } = renderHook(() => useImportRecords(owners));

    expect(result.current.f1.accounts).toEqual([
      { currency: "BRL", id: "a3", name: "Da família" },
    ]);
    expect(result.current.f1.cards).toEqual([]);
    expect(result.current.f1.categories.map((item) => item.id)).toEqual([
      "fam",
    ]);
  });
});
