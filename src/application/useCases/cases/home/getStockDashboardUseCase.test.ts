import StockDashboardDTO from "@application/dto/home/StockDashboardDTO";
import { BusinessError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getStockDashboardUseCase.mocks";

const getUserSpy = spies.userRepository.getUser;
const getFamiliesSpy = spies.familyRepository.getFamilies;
const getStockItemsSpy = spies.stockRepository.getStockItems;

it("SHOULD get all families related with the user", async () => {
  await setup();

  expect(getFamiliesSpy).toHaveBeenCalledTimes(1);
  expect(getFamiliesSpy).toHaveBeenCalledWith(mocks.user.id);
});

it("SHOULD get all stock items related with the user and families", async () => {
  await setup();

  expect(getStockItemsSpy).toHaveBeenCalledTimes(3);
  expect(getStockItemsSpy).toHaveBeenNthCalledWith(1, mocks.families[0].id);
  expect(getStockItemsSpy).toHaveBeenNthCalledWith(2, mocks.families[1].id);
  expect(getStockItemsSpy).toHaveBeenNthCalledWith(3, mocks.user.id);
});

it("SHOULD return the StockDashboardDTO from user and families flatted", async () => {
  const result = await setup();

  expect(result).toBeInstanceOf(StockDashboardDTO);
  expect(result).toEqual(StockDashboardDTO.fromEntity(mocks.stockItems));
});

it("SHOULD throw if the repository throws", async () => {
  getUserSpy.mockRejectedValueOnce(mocks.errors.unknown);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(Error);
  expect(result).toHaveProperty("message", "Some error");
});

it("SHOULD throw if the repository throws a business error", async () => {
  getUserSpy.mockRejectedValueOnce(mocks.errors.business);

  const result = await setupThrowable();

  expect(result).toBeInstanceOf(BusinessError);
  expect(result).toHaveProperty("message", "Occurred a business error");
  expect(result).toHaveProperty("context", {
    any_context: "any_value",
    useCase: "getStockDashboardUseCase",
  });
});
