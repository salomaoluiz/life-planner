import ConfigsEntity, {
  ThemeMode,
} from "@domain/entities/configs/ConfigsEntity";

import ConfigsDTO, { IConfigsDTO } from "../ConfigsDTO";

// region mocks
const defaultProps = {
  language: "en-US",
  themeMode: ThemeMode.SYSTEM,
} as IConfigsDTO;

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
