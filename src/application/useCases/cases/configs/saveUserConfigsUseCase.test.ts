import { SaveUserConfigsUseCaseParams } from "@application/useCases/cases/configs/saveUserConfigsUseCase";
import { DefaultError } from "@domain/entities/errors";
import { DeepRequired } from "@utils/types";

import {
  mocks,
  setup,
  setupThrowable,
  spies,
} from "./mocks/saveUserConfigsUseCase.mocks";

it("SHOULD save the default Configs", async () => {
  spies.configsRepository.getConfigs.mockResolvedValueOnce(mocks.configsEntity);

  await setup();

  expect(spies.configsRepository.getConfigs).toHaveBeenCalledTimes(1);
  expect(spies.configsRepository.saveConfigs).toHaveBeenCalledTimes(1);
  expect(spies.configsRepository.saveConfigs).toHaveBeenCalledWith({
    darkMode: mocks.configsEntity.darkMode,
    language: mocks.configsEntity.language,
  });
});

it("SHOULD save the Configs provided", async () => {
  spies.configsRepository.getConfigs.mockResolvedValueOnce(mocks.configsEntity);

  const allParams: DeepRequired<SaveUserConfigsUseCaseParams> = {
    darkMode: true,
    language: "pt-BR",
  };

  await setup(allParams);

  expect(spies.configsRepository.saveConfigs).toHaveBeenCalledTimes(1);
  expect(spies.configsRepository.saveConfigs).toHaveBeenCalledWith({
    darkMode: allParams.darkMode,
    language: allParams.language,
  });
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
    useCase: "saveUserConfigsUseCase",
  });
});
