import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/confirmTransactionUseCase.mocks";

const confirmSpy = spies.financialRepositoryTransaction.confirmTransaction;

it("SHOULD confirm the projected purchase with the real value and date", async () => {
  await setup({ invoiceMonth: "2026-10" });

  expect(confirmSpy).toHaveBeenCalledWith({
    date: mocks.defaultParams.date,
    id: mocks.defaultParams.id,
    invoiceMonth: "2026-10",
    ownerId: mocks.defaultParams.ownerId,
    value: mocks.defaultParams.value,
  });
});

it("SHOULD add the use case to a business error AND rethrow it", async () => {
  confirmSpy.mockRejectedValueOnce(mocks.errors.business);

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(BusinessError);
  expect((error as BusinessError).context).toMatchObject({
    useCase: "financial.confirmTransactionUseCase",
  });
});
