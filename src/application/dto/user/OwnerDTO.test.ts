import OwnerDTO from "@application/dto/user/OwnerDTO";

import { mocks, setupFromEntity } from "./mocks/OwnerDTO.mocks";

it("SHOULD render correctly from entity", () => {
  const result = setupFromEntity();

  expect(result).toEqual(
    new OwnerDTO({
      id: mocks.defaultProps.id,
      name: mocks.defaultProps.name,
      type: mocks.defaultProps.type,
    }),
  );
});
