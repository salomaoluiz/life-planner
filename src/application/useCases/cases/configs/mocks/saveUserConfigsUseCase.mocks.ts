import { repositoriesMocks } from "@data/repositories/mocks";
import ConfigsEntityFixture from "@domain/entities/configs/mocks/ConfigsEntity.fixture";
import { BusinessError } from "@domain/entities/errors";

import saveUserConfigsUseCase, {
  SaveUserConfigsUseCaseParams,
} from "../saveUserConfigsUseCase";

// region mocks
const configsEntityMock = new ConfigsEntityFixture().withDefault().build();

const unknownError = new Error("Unknown error");
const businessError = new BusinessError();
businessError.addContext({ any_context: "any_mocked_context" });

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(props: SaveUserConfigsUseCaseParams = {}) {
  return saveUserConfigsUseCase(repositoriesMocks).execute(props);
}

async function setupThrowable() {
  try {
    await setup();
  } catch (error) {
    return error;
  }
}

const spies = {
  configsRepository: jest.mocked(repositoriesMocks.configsRepository),
};

const mocks = {
  configsEntity: configsEntityMock,
  errors: {
    business: businessError,
    unknown: unknownError,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, setupThrowable, spies };
