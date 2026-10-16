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
