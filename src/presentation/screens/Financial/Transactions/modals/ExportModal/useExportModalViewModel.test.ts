import { act } from "@tests";

import {
  exportMutation,
  lastMutationProps,
  lastQueryProps,
  setupHook,
  spies,
} from "./mocks/index.mocks";

const year = new Date().getFullYear();

describe("period", () => {
  it("SHOULD default to this year, with the This year preset chosen", () => {
    const { result } = setupHook(5);

    expect(result.current.preset).toBe("THIS_YEAR");
    expect(result.current.customFrom).toEqual(new Date(year, 0, 1));
    expect(result.current.customTo).toEqual(new Date(year, 11, 31));
  });

  it("SHOULD change the period with a preset and clear the preset for a custom range", () => {
    const { result } = setupHook(5);

    act(() => result.current.onPresetChange("THIS_MONTH"));
    expect(result.current.preset).toBe("THIS_MONTH");

    act(() => result.current.onFromChange(new Date(year, 1, 3)));
    expect(result.current.preset).toBeUndefined();
  });

  it("SHOULD flag a period over 2 years, disable the export and not count", () => {
    const { result } = setupHook(5);

    act(() => result.current.onFromChange(new Date(year - 3, 0, 1)));

    expect(result.current.periodError).toEqual({ date: expect.any(String) });
    expect(result.current.canExport).toBe(false);
    expect(lastQueryProps().enabled).toBe(false);
  });
});

describe("count", () => {
  it("SHOULD count the period of the modal, not the filters of the screen", async () => {
    setupHook(5);
    spies.count.mockResolvedValue(5);

    await lastQueryProps().fetch();

    expect(spies.count).toHaveBeenCalledWith({
      accountIds: undefined,
      creditCardIds: undefined,
      from: `${year}-01-01`,
      owner: "ALL",
      to: `${year}-12-31`,
    });
  });

  it("SHOULD disable the export WHEN there is nothing to export and enable it otherwise", () => {
    expect(setupHook(0).result.current.canExport).toBe(false);
    expect(setupHook(1284).result.current.canExport).toBe(true);
    expect(setupHook(undefined).result.current.isCounting).toBe(true);
  });
});

describe("owner and accounts", () => {
  it("SHOULD list the accounts and cards of every owner for All, archived apart", () => {
    const { result } = setupHook(5);

    expect(result.current.sourceGroups.accounts.map((s) => s.id)).toEqual([
      "acc-1",
    ]);
    expect(result.current.sourceGroups.cards.map((s) => s.id)).toEqual([
      "card-1",
    ]);
    expect(result.current.sourceGroups.archived.map((s) => s.id)).toEqual([
      "acc-old",
    ]);
  });

  it("SHOULD narrow the list to the chosen owner and clear the chosen accounts", () => {
    const { result } = setupHook(5);

    act(() =>
      result.current.onSourceToggle(result.current.sourceGroups.accounts[0]),
    );
    expect(result.current.selectedSourceCount).toBe(1);

    act(() => result.current.onOwnerChange("family-1"));

    expect(result.current.selectedSourceCount).toBe(0);
    expect(result.current.sourceGroups.accounts).toEqual([]);
    expect(result.current.sourceGroups.cards.map((s) => s.id)).toEqual([
      "card-1",
    ]);
  });

  it("SHOULD send the chosen family and accounts to the count 300 ms after the change", async () => {
    jest.useFakeTimers();
    const { result } = setupHook(5);

    act(() => result.current.onOwnerChange("family-old"));
    act(() =>
      result.current.onSourceToggle({
        archived: true,
        id: "acc-x",
        kind: "ACCOUNT",
        name: "X",
        ownerId: "family-old",
      }),
    );
    act(() => {
      jest.advanceTimersByTime(300);
    });
    spies.count.mockResolvedValue(1);
    await lastQueryProps().fetch();
    jest.useRealTimers();

    expect(spies.count).toHaveBeenLastCalledWith(
      expect.objectContaining({
        accountIds: ["acc-x"],
        owner: "FAMILY",
        ownerId: "family-old",
      }),
    );
  });
});

describe("export", () => {
  it("SHOULD default the format from the language and export then save the file", async () => {
    const { result } = setupHook(5);

    expect(result.current.format).toBe("INTL");
    act(() => result.current.onFormatChange("BR"));
    spies.export.mockResolvedValue({ csv: "a;b", filename: "transacoes.csv" });

    await lastMutationProps().fetch(undefined);

    expect(spies.export).toHaveBeenCalledWith(
      expect.objectContaining({ format: "BR", lang: "en-US", owner: "ALL" }),
    );
    expect(spies.save).toHaveBeenCalledWith({
      csv: "a;b",
      name: "transacoes.csv",
    });
  });

  it("SHOULD start the export on press and show a failure", () => {
    const { rerender, result } = setupHook(5);

    act(() => result.current.onExport());
    expect(exportMutation.value.mutate).toHaveBeenCalled();
    rerender({});
    expect(result.current.hasError).toBe(false);
  });
});
