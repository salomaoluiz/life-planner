import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getInvestmentsSummaryUseCase.mocks";

it("SHOULD read the summary of the selected owners for the local date", async () => {
  await setup(["a", "b"], "2026-11-04");

  expect(spies.investmentRepository.getHomeSummary).toHaveBeenCalledWith({
    ownerIds: ["a", "b"],
    today: "2026-11-04",
  });
});

it("SHOULD return the entity the repository gives", async () => {
  expect(await setup()).toBe(mocks.entity);
});

it("SHOULD rethrow an unknown error untouched", async () => {
  spies.investmentRepository.getHomeSummary.mockRejectedValueOnce(
    mocks.errors.unknown,
  );

  expect(await setupThrowable()).toBe(mocks.errors.unknown);
});

it("SHOULD add the use case to the context of a business error", async () => {
  spies.investmentRepository.getHomeSummary.mockRejectedValueOnce(
    mocks.errors.business,
  );

  const error = (await setupThrowable()) as BusinessError;

  expect(error).toBe(mocks.errors.business);
  expect(error.context).toMatchObject({
    any_context: "any_value",
    useCase: "home.getInvestmentsSummaryUseCase",
  });
});
