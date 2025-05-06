import ConfigsEntity from "@domain/entities/configs/ConfigsEntity";

import ConfigsDTO, { IConfigsDTO } from "../ConfigsDTO";

// region mocks
const defaultProps = { darkMode: false, language: "en-US" } as IConfigsDTO;

// endregion mocks

// region spies

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setupFromEntity(
  entity: ConfigsEntity = ConfigsEntity.defaultConfigs(),
) {
  return ConfigsDTO.fromEntity(entity);
}

const spies = {};

const mocks = {
  defaultProps,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setupFromEntity, spies };
