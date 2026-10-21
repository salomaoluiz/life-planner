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
): ChainCategory {
  return {
    depthLevel,
    id,
    name,
    parentId,
    scopeOwnerIds: ["o1"],
    status: "ACTIVE",
  };
}

// A fake store: create adds the category, list returns them.
function store(initial: ChainCategory[]) {
  const items = [...initial];
  const calls: { depthLevel: number; name: string; parentId?: string }[] = [];

  return {
    calls,
    deps: {
      create: async (params: {
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

    await createCategoryChain(["Finanças"], "o1", { depthLevel: 0 }, deps);

    expect(calls).toHaveLength(1);
  });

  it("SHOULD start inside the chosen parent", async () => {
    const { calls, deps } = store([cat("p", "Casa")]);

    await createCategoryChain(
      ["Mercado"],
      "o1",
      { depthLevel: 1, parentId: "p" },
      deps,
    );

    expect(calls).toEqual([{ depthLevel: 1, name: "Mercado", parentId: "p" }]);
  });
});
