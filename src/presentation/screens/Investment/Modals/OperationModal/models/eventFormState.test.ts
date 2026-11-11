import { InvestmentOperationType } from "@domain/entities/investment/enums";
import {
  makeEventOperation,
  makeEventSuggestion,
  makeOperation,
} from "@screens/Investment/mocks/fixtures";

import {
  defaultDraft,
  draftFromOperation,
  draftFromSuggestion,
  EventDraft,
  hasEventErrors,
  isSameDraft,
  toApproveParams,
  toCreateParams,
  toUpdateParams,
  validateDraft,
} from "./eventFormState";

const { BONUS, REVERSE_SPLIT, SPLIT } = InvestmentOperationType;

function draft(overrides: Partial<EventDraft> = {}): EventDraft {
  return {
    ...defaultDraft(),
    date: new Date(2026, 2, 10),
    ratioFrom: "10",
    ratioTo: "1",
    type: REVERSE_SPLIT,
    ...overrides,
  };
}

describe("drafts", () => {
  it("SHOULD start as an empty split dated today", () => {
    expect(defaultDraft()).toMatchObject({
      bonusPercent: "",
      ratioFrom: "",
      ratioTo: "",
      type: SPLIT,
    });
  });

  it("SHOULD read the fields of an event AND of a suggestion", () => {
    expect(draftFromOperation(makeEventOperation())).toMatchObject({
      date: new Date(2026, 2, 10),
      ratioFrom: "10",
      ratioTo: "1",
      type: REVERSE_SPLIT,
    });
    expect(draftFromSuggestion(makeEventSuggestion())).toMatchObject({
      bonusPercent: "10",
      bonusUnitCost: "4.5",
      date: new Date(2026, 10, 18),
      type: BONUS,
    });
  });

  it("SHOULD fall back to a split WHEN the operation is not an event", () => {
    expect(draftFromOperation(makeOperation()).type).toBe(SPLIT);
  });

  it("SHOULD compare drafts by type, day AND fields", () => {
    expect(isSameDraft(draft(), draft())).toBe(true);
    expect(isSameDraft(draft(), draft({ ratioTo: "2" }))).toBe(false);
    expect(isSameDraft(draft(), draft({ date: new Date(2026, 2, 11) }))).toBe(
      false,
    );
  });
});

describe("validateDraft", () => {
  it("SHOULD accept a valid split, reverse split AND bonus", () => {
    expect(hasEventErrors(validateDraft(draft()))).toBe(false);
    expect(
      hasEventErrors(
        validateDraft(draft({ ratioFrom: "1", ratioTo: "4", type: SPLIT })),
      ),
    ).toBe(false);
    expect(
      hasEventErrors(
        validateDraft(
          draft({ bonusPercent: "10", bonusUnitCost: "", type: BONUS }),
        ),
      ),
    ).toBe(false);
  });

  it("SHOULD need ratios above zero AND the right direction", () => {
    expect(validateDraft(draft({ ratioFrom: "", type: SPLIT })).ratioFrom).toBe(
      "investment.event.errors.ratio",
    );
    expect(
      validateDraft(draft({ ratioFrom: "4", ratioTo: "1", type: SPLIT }))
        .ratioTo,
    ).toBe("investment.event.errors.splitDirection");
    expect(
      validateDraft(
        draft({ ratioFrom: "1", ratioTo: "4", type: REVERSE_SPLIT }),
      ).ratioTo,
    ).toBe("investment.event.errors.reverseDirection");
    expect(validateDraft(draft({ ratioTo: "0" })).ratioTo).toBe(
      "investment.event.errors.ratio",
    );
    expect(
      validateDraft(draft({ ratioTo: "1000001", type: SPLIT })).ratioTo,
    ).toBe("investment.event.errors.ratio");
  });

  it("SHOULD need a bonus percent up to 1000 AND a valid cost per share", () => {
    expect(validateDraft(draft({ type: BONUS })).bonusPercent).toBe(
      "investment.event.errors.percent",
    );
    expect(
      validateDraft(draft({ bonusPercent: "1000.5", type: BONUS }))
        .bonusPercent,
    ).toBe("investment.event.errors.percent");
    expect(
      validateDraft(
        draft({ bonusPercent: "10", bonusUnitCost: "x", type: BONUS }),
      ).bonusUnitCost,
    ).toBe("investment.event.errors.unitCost");
    expect(
      validateDraft(
        draft({ bonusPercent: "10", bonusUnitCost: "0", type: BONUS }),
      ).bonusUnitCost,
    ).toBeUndefined();
  });
});

describe("params", () => {
  it("SHOULD create with the fields of the type only", () => {
    expect(toCreateParams("asset-1", draft())).toEqual({
      assetId: "asset-1",
      bonusUnitCost: undefined,
      date: "2026-03-10",
      ratioFrom: "10",
      ratioTo: "1",
      type: "REVERSE_SPLIT",
    });
    expect(
      toCreateParams(
        "asset-1",
        draft({ bonusPercent: "10", bonusUnitCost: "4,5", type: BONUS }),
      ),
    ).toEqual({
      assetId: "asset-1",
      bonusPercent: "10",
      bonusUnitCost: "4,5",
      date: "2026-03-10",
      type: "BONUS",
    });
  });

  it("SHOULD clear the cost per share on an edit WHEN it was emptied", () => {
    expect(
      toUpdateParams(
        "event-1",
        draft({ bonusPercent: "5", bonusUnitCost: " ", type: BONUS }),
      ),
    ).toEqual({
      bonusPercent: "5",
      bonusUnitCost: null,
      date: "2026-03-10",
      id: "event-1",
    });
    expect(toUpdateParams("event-1", draft())).toEqual({
      date: "2026-03-10",
      id: "event-1",
      ratioFrom: "10",
      ratioTo: "1",
    });
  });

  it("SHOULD approve with the values on screen", () => {
    expect(
      toApproveParams(
        "sug-1",
        draft({ bonusPercent: "5", bonusUnitCost: "", type: BONUS }),
      ),
    ).toEqual({
      bonusPercent: "5",
      bonusUnitCost: "",
      date: "2026-03-10",
      id: "sug-1",
      type: "BONUS",
    });
  });
});
