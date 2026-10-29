import {
  ChainCategory,
  createCategoryChain,
  splitCategoryPath,
} from "./categoryChain";

function cat(
  id: string,
  name: string,
  parentId?: string,
  depthLevel = 0,
  scope?: "ALL",
  type = "EXPENSE",
): ChainCategory {
  return {
    depthLevel,
    id,
    name,
    parentId,
    scope,
    scopeOwnerIds: ["o1"],
    status: "ACTIVE",
    type,
  };
}

// A fake store: create adds the category, list returns them.
function store(initial: ChainCategory[], type = "EXPENSE") {
  const items = [...initial];
  const calls: {
    all?: boolean;
    depthLevel: number;
    name: string;
    parentId?: string;
  }[] = [];

  return {
    calls,
    deps: {
      create: async (params: {
        all?: boolean;
        depthLevel: number;
        name: string;
        parentId?: string;
      }) => {
        calls.push(params);
        items.push(
          cat(
            `new-${items.length}`,
            params.name,
            params.parentId,
            params.depthLevel,
            params.all ? "ALL" : undefined,
            type,
          ),
        );
      },
      list: async () => [...items],
    },
  };
}

describe("splitCategoryPath", () => {
  it("SHOULD split on >, / and : and trim", () => {
    expect(
      splitCategoryPath(" Finanças > Investimentos / Renda fixa:CDB "),
    ).toEqual(["Finanças", "Investimentos", "Renda fixa", "CDB"]);
    expect(splitCategoryPath("Mercado")).toEqual(["Mercado"]);
    expect(splitCategoryPath(" > ")).toEqual([]);
  });
});

describe("createCategoryChain", () => {
  it("SHOULD create the parent and then the child inside it", async () => {
    const { calls, deps } = store([]);

    await createCategoryChain(
      ["Finanças", "Transferências entre contas"],
      "o1",
      { depthLevel: 0 },
      deps,
      "OWNER",
      "EXPENSE",
    );

    expect(calls).toEqual([
      { depthLevel: 0, name: "Finanças", parentId: undefined },
      { depthLevel: 1, name: "Transferências entre contas", parentId: "new-0" },
    ]);
  });

  it("SHOULD create three levels", async () => {
    const { calls, deps } = store([]);

    await createCategoryChain(
      ["Finanças", "Investimentos", "Renda fixa"],
      "o1",
      { depthLevel: 0 },
      deps,
      "OWNER",
      "EXPENSE",
    );

    expect(calls.map((call) => [call.name, call.depthLevel])).toEqual([
      ["Finanças", 0],
      ["Investimentos", 1],
      ["Renda fixa", 2],
    ]);
  });

  it("SHOULD reuse the levels that exist, ignoring case and accents", async () => {
    const { calls, deps } = store([
      cat("fin", "Finanças"),
      cat("inv", "Investimentos", "fin", 1),
    ]);

    await createCategoryChain(
      ["financas", "INVESTIMENTOS", "Renda fixa"],
      "o1",
      { depthLevel: 0 },
      deps,
      "OWNER",
      "EXPENSE",
    );

    expect(calls).toEqual([
      { depthLevel: 2, name: "Renda fixa", parentId: "inv" },
    ]);
  });

  it("SHOULD not reuse an archived category or one of another owner", async () => {
    const { calls, deps } = store([
      { ...cat("old", "Finanças"), status: "ARCHIVED" },
      { ...cat("other", "Finanças"), scopeOwnerIds: ["o2"] },
    ]);

    await createCategoryChain(
      ["Finanças"],
      "o1",
      { depthLevel: 0 },
      deps,
      "OWNER",
      "EXPENSE",
    );

    expect(calls).toHaveLength(1);
  });

  it("SHOULD start inside the chosen parent", async () => {
    const { calls, deps } = store([cat("p", "Casa")]);

    await createCategoryChain(
      ["Mercado"],
      "o1",
      { depthLevel: 1, parentId: "p" },
      deps,
      "OWNER",
      "EXPENSE",
    );

    expect(calls).toEqual([{ depthLevel: 1, name: "Mercado", parentId: "p" }]);
  });

  describe("All scope (spec 048 FR 29b)", () => {
    it("SHOULD create every level as an All category", async () => {
      const { calls, deps } = store([]);

      await createCategoryChain(
        ["Mercado", "Limpeza"],
        "o1",
        { depthLevel: 0 },
        deps,
        "ALL",
        "EXPENSE",
      );

      expect(calls).toEqual([
        { all: true, depthLevel: 0, name: "Mercado", parentId: undefined },
        { all: true, depthLevel: 1, name: "Limpeza", parentId: "new-0" },
      ]);
    });

    it("SHOULD reuse only All categories and create the rest as All", async () => {
      const { calls, deps } = store([
        cat("own", "Mercado"),
        cat("all", "Mercado", undefined, 0, "ALL"),
      ]);

      await createCategoryChain(
        ["Mercado", "Limpeza"],
        "o1",
        { depthLevel: 0 },
        deps,
        "ALL",
        "EXPENSE",
      );

      expect(calls).toEqual([
        { all: true, depthLevel: 1, name: "Limpeza", parentId: "all" },
      ]);
    });

    it("SHOULD follow an All parent it reuses, even when the owner scope was chosen", async () => {
      const { calls, deps } = store([
        cat("all", "Mercado", undefined, 0, "ALL"),
      ]);

      await createCategoryChain(
        ["Mercado", "Limpeza"],
        "o1",
        { depthLevel: 0 },
        deps,
        "OWNER",
        "EXPENSE",
      );

      expect(calls).toEqual([
        { all: true, depthLevel: 1, name: "Limpeza", parentId: "all" },
      ]);
    });
  });

  describe("type (spec 054 FR 1-3)", () => {
    const incomeCasa = cat(
      "casa-in",
      "Casa",
      undefined,
      0,
      undefined,
      "INCOME",
    );
    const expenseCasa = cat("casa-ex", "Casa");

    it("SHOULD create the child under the income Casa WHEN both exist, expense first", async () => {
      const { calls, deps } = store([expenseCasa, incomeCasa], "INCOME");

      await createCategoryChain(
        ["Casa", "Aluguel recebido"],
        "o1",
        { depthLevel: 0 },
        deps,
        "OWNER",
        "INCOME",
      );

      expect(calls).toEqual([
        { depthLevel: 1, name: "Aluguel recebido", parentId: "casa-in" },
      ]);
    });

    it("SHOULD create the child under the income Casa WHEN the income one is listed first", async () => {
      const { calls, deps } = store([incomeCasa, expenseCasa], "INCOME");

      await createCategoryChain(
        ["Casa", "Aluguel recebido"],
        "o1",
        { depthLevel: 0 },
        deps,
        "OWNER",
        "INCOME",
      );

      expect(calls).toEqual([
        { depthLevel: 1, name: "Aluguel recebido", parentId: "casa-in" },
      ]);
    });

    it("SHOULD create an income Casa and its child WHEN only the expense Casa exists", async () => {
      const { calls, deps } = store([expenseCasa], "INCOME");

      await createCategoryChain(
        ["Casa", "Aluguel recebido"],
        "o1",
        { depthLevel: 0 },
        deps,
        "OWNER",
        "INCOME",
      );

      expect(calls).toEqual([
        { depthLevel: 0, name: "Casa", parentId: undefined },
        { depthLevel: 1, name: "Aluguel recebido", parentId: "new-1" },
      ]);
    });
  });
});
