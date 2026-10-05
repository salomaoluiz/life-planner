import ConfigsDTO from "@application/dto/configs/ConfigsDTO";

import { mocks, setupFromEntity } from "./mocks/ConfigsDTO.mocks";

it("SHOULD render correctly from entity", () => {
  const result = setupFromEntity();

  expect(result).toEqual(
    new ConfigsDTO({
      language: mocks.defaultProps.language,
      themeMode: mocks.defaultProps.themeMode,
    }),
  );
});
