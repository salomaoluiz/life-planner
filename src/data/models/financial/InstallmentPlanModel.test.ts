import InstallmentPlanModel from "./InstallmentPlanModel";
import { apiInstallmentPlan } from "./mocks/InstallmentPlan.mocks";

it("SHOULD turn cents into decimal strings, the calendar date into an ISO date AND keep the rows", () => {
  const model = InstallmentPlanModel.fromJSON(apiInstallmentPlan);

  expect(model.totalValue).toBe("66.67");
  expect(model.installments[0]).toEqual({
    id: "row-1",
    installmentNumber: 1,
    invoiceMonth: "2026-10",
    invoiceStatus: "OPEN",
    prepaid: false,
    value: "33.34",
  });
  expect(model.installmentCount).toBe(2);
  expect(model.overLimit).toBe(true);
  expect(new Date(model.date).getDate()).toBe(20);
});

it("SHOULD leave overLimit undefined WHEN the API does not send it", () => {
  const withoutOverLimit = { ...apiInstallmentPlan, overLimit: undefined };

  expect(
    InstallmentPlanModel.fromJSON(withoutOverLimit).overLimit,
  ).toBeUndefined();
});

it("SHOULD map the prepayment and the prepaid rows (spec 032)", () => {
  const model = InstallmentPlanModel.fromJSON({
    ...apiInstallmentPlan,
    installments: [{ ...apiInstallmentPlan.installments[0], prepaid: true }],
    plan: {
      ...apiInstallmentPlan.plan,
      prepayment: {
        date: "2026-10-16",
        discount: 12000,
        id: "prepayment-1",
        targetInvoiceMonth: "2026-10",
      },
    },
  });

  expect(model.prepayment).toEqual({
    date: "2026-10-16",
    discount: 12000,
    id: "prepayment-1",
    targetInvoiceMonth: "2026-10",
  });
  expect(model.installments[0].prepaid).toBe(true);
  expect(
    InstallmentPlanModel.fromJSON(apiInstallmentPlan).prepayment,
  ).toBeUndefined();
});

it("SHOULD read the notes of the plan, null meaning none (spec 059)", () => {
  function withNotes(notes: null | string) {
    return {
      ...apiInstallmentPlan,
      plan: { ...apiInstallmentPlan.plan, notes },
    };
  }

  expect(InstallmentPlanModel.fromJSON(withNotes("Presente")).notes).toBe(
    "Presente",
  );
  expect(InstallmentPlanModel.fromJSON(withNotes(null)).notes).toBeUndefined();
});
