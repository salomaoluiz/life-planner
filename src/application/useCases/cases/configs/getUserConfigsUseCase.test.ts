import ConfigsDTO from "@application/dto/configs/ConfigsDTO";
import { DefaultError } from "@domain/entities/errors";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/getUserConfigsUseCase.mocks";

it("SHOULD return the ConfigDTO", async () => {
  spies.configsRepository.getConfigs.mockResolvedValueOnce(mocks.configsEntity);

  const result = await setup();

  expect(result).toEqual(
    new ConfigsDTO({
      darkMode: mocks.configsEntity.darkMode,
      language: mocks.configsEntity.language,
    }),
  );
});

it("SHOULD throw an error when configsRepository throws an UNKNOWN error", async () => {
  spies.configsRepository.getConfigs.mockRejectedValueOnce(
    mocks.errors.unknown,
  );

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(Error);
  expect(error).toEqual(mocks.errors.unknown);
});

it("SHOULD throw an error when configsRepository throws a BUSINESS error", async () => {
  spies.configsRepository.getConfigs.mockRejectedValueOnce(
    mocks.errors.business,
  );

  const error = await setupThrowable();

  expect(error).toBeInstanceOf(DefaultError);
  expect(error).toEqual(mocks.errors.business);
  expect((error as DefaultError).context).toEqual({
    ...mocks.errors.business.context,
    useCase: "getUserConfigsUseCase",
  });
});
