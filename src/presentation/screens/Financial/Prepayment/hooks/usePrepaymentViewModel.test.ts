import { act } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import {
  givenLoaded,
  mutations,
  queries,
  setup,
  spies,
} from "./mocks/usePrepaymentViewModel.mocks";

it("SHOULD stay loading until the plan and the cards arrive", () => {
  expect(setup().result.current.isLoading).toBe(true);

  givenLoaded();
  expect(setup().result.current.isLoading).toBe(false);
});

it("SHOULD offer the open invoice first (the default target) AND the closed unpaid ones", () => {
  givenLoaded();
  const { result } = setup();

  expect(result.current.invoices.map((invoice) => invoice.month)).toEqual([
    "2026-10",
    "2026-09",
  ]);
  expect(result.current.targetMonth).toBe("2026-10");
  expect(
    spies.useQuery.mock.calls.some((call) => call[0].cacheKey[2] === "2026-10"),
  ).toBe(true);
});

it("SHOULD describe what moves AND the resulting invoice (3.584 - 120 = 3.464 style)", () => {
  givenLoaded();
  const { result } = setup();

  expect(result.current.summary).toEqual({
    count: 3,
    first: "4/10",
    last: "6/10",
  });
  expect(result.current.movedCents).toBe(153600);
  expect(result.current.resultingTotalCents).toBe(153600);

  act(() => result.current.onHasDiscountChange(true));
  act(() => result.current.onDiscountChange(12000));
  expect(result.current.resultingTotalCents).toBe(141600);

  act(() => result.current.onTargetChange("2026-09"));
  expect(result.current.targetMonth).toBe("2026-09");
  expect(result.current.resultingTotalCents).toBe(100000 + 153600 - 12000);
});

it("SHOULD prepay into the target with the discount and today's date", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onHasDiscountChange(true));
  act(() => result.current.onDiscountChange(12000));
  act(() => result.current.onConfirm());

  expect(mutations.prepay.value.mutate).toHaveBeenCalledWith({
    date: "2026-10-16",
    discount: 12000,
    planId: "plan-1",
    targetInvoiceMonth: "2026-10",
  });
});

it("SHOULD send no discount WHEN the switch is off AND use the chosen date", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onDateChange(new Date(2026, 9, 3)));
  act(() => result.current.onDateChange(undefined));
  act(() => result.current.onConfirm());

  expect(mutations.prepay.value.mutate).toHaveBeenCalledWith(
    expect.objectContaining({ date: "2026-10-03", discount: undefined }),
  );
});

it("SHOULD NOT prepay AND show the error WHEN the discount is invalid", () => {
  givenLoaded();
  const { result } = setup();

  act(() => result.current.onHasDiscountChange(true));
  act(() => result.current.onConfirm());

  expect(mutations.prepay.value.mutate).not.toHaveBeenCalled();
  expect(result.current.errors.discount).toBe(
    "financial.prepayment.errors.discount",
  );

  act(() => result.current.onDiscountChange(153601));
  act(() => result.current.onConfirm());
  expect(mutations.prepay.value.mutate).not.toHaveBeenCalled();
});

it("SHOULD NOT prepay WHEN nothing is eligible", () => {
  givenLoaded();
  queries.preview.withData({ eligible: [], total: 0 } as never);
  const { result } = setup();

  act(() => result.current.onConfirm());

  expect(result.current.isEmpty).toBe(true);
  expect(mutations.prepay.value.mutate).not.toHaveBeenCalled();
});

it("SHOULD refresh the lists AND close WHEN the prepayment succeeds", () => {
  givenLoaded();
  mutations.prepay.withStatus("success");

  setup();

  expect(spies.invalidate).toHaveBeenCalledWith(["overview"]);
  expect(spies.invalidate).toHaveBeenCalledWith(["summary"]);
  expect(spies.invalidate).toHaveBeenCalledWith(["plan"]);
  expect(modalNavigation.closeModal).toHaveBeenCalled();
});

it("SHOULD map a prepayment error to its copy key AND close on demand", () => {
  givenLoaded();
  mutations.prepay.withError();
  const { result } = setup();

  expect(result.current.formErrorKey).toBe("common.errors.generic");
  act(() => result.current.onClose());
  expect(modalNavigation.closeModal).toHaveBeenCalled();
});
