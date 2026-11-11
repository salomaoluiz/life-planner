import OwnerDTO from "@application/dto/user/OwnerDTO";
import {
  InvestmentAssetClass,
  InvestmentAssetStatus,
} from "@domain/entities/investment/enums";
import { InvestmentAsset } from "@domain/entities/investment/InvestmentEntities";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

import { buildEntries, filterAssets, labelOf } from "./assetList";

const owners = [
  new OwnerDTO({ id: "user", name: "Me", type: OwnerType.USER }),
  new OwnerDTO({ id: "fam", name: "Home", type: OwnerType.FAMILY }),
  new OwnerDTO({
    archived: true,
    id: "old",
    name: "Old",
    type: OwnerType.FAMILY,
  }),
];

function asset(
  id: string,
  overrides: Partial<InvestmentAsset> = {},
  position: Partial<InvestmentAsset["position"]> = {},
): InvestmentAsset {
  return {
    archivedAt: null,
    assetClass: InvestmentAssetClass.BR_STOCK,
    averageFxRate: null,
    brl: null,
    currency: "BRL",
    fixedIncome: null,
    fx: null,
    id,
    name: `Name ${id}`,
    operationCount: 1,
    operationsWithoutFxRate: 0,
    owner: OwnerType.USER,
    ownerId: "user",
    pendingEventSuggestions: 0,
    pendingFractionCount: 0,
    position: {
      averagePrice: null,
      cost: 1000,
      currentUnitPrice: null,
      currentValue: 1500,
      currentValueDate: null,
      openResult: 500,
      openResultPercent: 0.5,
      pendingFractions: [],
      quantity: "1",
      realizedResult: 0,
      ...position,
    },
    priceSource: null,
    quote: null,
    status: InvestmentAssetStatus.ACTIVE,
    ticker: id.toUpperCase(),
    ...overrides,
  };
}

describe("buildEntries", () => {
  it("SHOULD group by class in order, then currency, with subtotals", () => {
    const entries = buildEntries(
      filterAssets(
        [
          asset("b", { assetClass: InvestmentAssetClass.BR_REIT }),
          asset("a"),
          asset("c"),
          asset("vt", {
            assetClass: InvestmentAssetClass.BR_STOCK,
            currency: "USD",
          }),
        ],
        owners,
        "ALL",
        "",
      ),
    );

    expect(entries.map((entry) => entry.key)).toEqual([
      "BR_STOCK-BRL",
      "a",
      "c",
      "BR_STOCK-USD",
      "vt",
      "BR_REIT-BRL",
      "b",
    ]);
    expect(entries[0]).toMatchObject({ cost: 2000, count: 2, current: 3000 });
    expect(entries[3]).toMatchObject({ cost: 1000, currency: "USD" });
  });

  it("SHOULD leave the current subtotal null WHEN no asset of the group has a value", () => {
    const [group] = buildEntries(
      filterAssets([asset("a", {}, { currentValue: null })], owners, "ALL", ""),
    );

    expect(group).toMatchObject({ cost: 1000, current: null });
  });

  it("SHOULD only sum the assets that have a value", () => {
    const [group] = buildEntries(
      filterAssets(
        [asset("a"), asset("b", {}, { currentValue: null })],
        owners,
        "ALL",
        "",
      ),
    );

    expect(group).toMatchObject({ cost: 2000, current: 1500 });
  });

  it("SHOULD return nothing for no assets", () => {
    expect(buildEntries([])).toEqual([]);
  });
});

describe("filterAssets", () => {
  const assets = [
    asset("a"),
    asset("fam1", { owner: OwnerType.FAMILY, ownerId: "fam" }),
    asset("old1", { owner: OwnerType.FAMILY, ownerId: "old" }),
  ];

  it("SHOULD hide archived families under All but show them when chosen", () => {
    expect(
      filterAssets(assets, owners, "ALL", "").map((r) => r.asset.id),
    ).toEqual(["a", "fam1"]);
    expect(
      filterAssets(assets, owners, "old", "").map((r) => r.asset.id),
    ).toEqual(["old1"]);
  });

  it("SHOULD filter by owner AND label the owner", () => {
    const rows = filterAssets(assets, owners, "fam", "");

    expect(rows.map((row) => row.asset.id)).toEqual(["fam1"]);
    expect(rows[0].ownerLabel).toEqual({ family: "Home" });
    expect(filterAssets(assets, owners, "user", "")[0].ownerLabel).toBe(
      "personal",
    );
  });

  it("SHOULD search ticker and name ignoring case and accents", () => {
    const list = [
      asset("itsa4", { name: "Itaúsa PN" }),
      asset("wege3", { name: "WEG ON" }),
      asset("p", { name: "Options", ticker: null }),
    ];

    expect(
      filterAssets(list, owners, "ALL", "ITAU").map((r) => r.asset.id),
    ).toEqual(["itsa4"]);
    expect(filterAssets(list, owners, "ALL", "wege").length).toBe(1);
    expect(filterAssets(list, owners, "ALL", "  ").length).toBe(3);
  });

  it("SHOULD label an asset by ticker, or by name without one", () => {
    expect(labelOf(asset("x"))).toBe("X");
    expect(labelOf(asset("x", { ticker: null }))).toBe("Name x");
  });

  it("SHOULD treat an unknown owner as personal", () => {
    expect(
      filterAssets([asset("z", { ownerId: "ghost" })], owners, "ghost", "")[0]
        .ownerLabel,
    ).toBe("personal");
  });
});
