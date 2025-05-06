import ConfigsDTO from "@application/dto/configs/ConfigsDTO";

import { mocks, setupFromEntity } from "./mocks/ConfigsDTO.mocks";

it("SHOULD render correctly from entity", () => {
  const result = setupFromEntity();

  expect(result).toEqual(
    new ConfigsDTO({
      darkMode: mocks.defaultProps.darkMode,
      language: mocks.defaultProps.language,
    }),
  );
});
