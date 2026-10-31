import UpcomingDTO from "@application/dto/home/UpcomingDTO";
import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getUpcomingItemsUseCase.mocks";

it("SHOULD read the upcoming items of the selected owners", async () => {
  await setup(["a", "b"]);

  expect(spies.upcomingRepository.getUpcoming).toHaveBeenCalledWith({
    ownerIds: ["a", "b"],
  });
});

it("SHOULD map the entity to a DTO with the overdue expense total", async () => {
  const result = await setup();

  expect(result).toBeInstanceOf(UpcomingDTO);
  expect(result.nextTotal).toBe(7);
  expect(result.overdue).toEqual(mocks.entity.overdue);
  expect(result.overdueExpenseCents).toBe(317000);
});

it("SHOULD rethrow an unknown error untouched", async () => {
  spies.upcomingRepository.getUpcoming.mockRejectedValueOnce(
    mocks.errors.unknown,
  );

  expect(await setupThrowable()).toBe(mocks.errors.unknown);
});

it("SHOULD add the use case to the context of a business error", async () => {
  spies.upcomingRepository.getUpcoming.mockRejectedValueOnce(
    mocks.errors.business,
  );

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect((result as BusinessError).context).toMatchObject({
    useCase: "home.getUpcomingItemsUseCase",
  });
});
