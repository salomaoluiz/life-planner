import { act } from "@tests";

import {
  addChange,
  removeChange,
  resetPending,
  resolveChange,
} from "../pending/pendingChanges";
import {
  dto,
  givenData,
  setup,
  ui,
} from "./mocks/useTransactionsViewModel.mocks";

const today = new Date();
const thisMonth = new Date(today.getFullYear(), today.getMonth(), 3);

beforeEach(() => resetPending());

describe("pending changes (spec 061)", () => {
  it("SHOULD list a pending create once, as saving, with the totals updating", () => {
    givenData([ui("stored", thisMonth)]);
    const { result } = setup();

    expect(result.current.isTotalsUpdating).toBe(false);

    act(() =>
      addChange({
        description: "New",
        id: "pending-1",
        kind: "create",
        row: dto("pending-1", thisMonth),
      }),
    );

    const items = result.current.entries.filter(
      (entry) => entry.kind === "item",
    );

    expect(items).toHaveLength(2);
    expect(
      items.filter(
        (entry) =>
          entry.kind === "item" && entry.item.pendingState === "saving",
      ),
    ).toHaveLength(1);
    expect(result.current.isTotalsUpdating).toBe(true);

    act(() => removeChange("pending-1"));
    expect(result.current.isTotalsUpdating).toBe(false);
    expect(
      result.current.entries.filter((entry) => entry.kind === "item"),
    ).toHaveLength(1);
  });

  it("SHOULD NOT double the row WHEN the refetched list already holds the created one", () => {
    givenData([ui("stored", thisMonth), ui("real-id", thisMonth)]);
    const { result } = setup();

    act(() => {
      addChange({
        description: "New",
        id: "pending-1",
        kind: "create",
        row: dto("pending-1", thisMonth),
      });
      resolveChange("pending-1", "real-id");
    });

    expect(
      result.current.entries.filter((entry) => entry.kind === "item"),
    ).toHaveLength(2);
  });

  it("SHOULD keep a deleting row in place until the change is removed", () => {
    givenData([ui("stored", thisMonth)]);
    const { result } = setup();

    act(() =>
      addChange({
        description: "Shop",
        id: "pending-2",
        kind: "delete",
        target: { transactionId: "stored" },
      }),
    );

    const [item] = result.current.entries.filter(
      (entry) => entry.kind === "item",
    );

    expect(item.kind === "item" && item.item.pendingState).toBe("deleting");
  });
});
