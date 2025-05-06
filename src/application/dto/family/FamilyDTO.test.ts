import FamilyDTO from "@application/dto/family/FamilyDTO";

import { mocks, setupFromEntity } from "./mocks/FamilyDTO.mocks";

it("SHOULD render correctly from entity", () => {
  const result = setupFromEntity();

  expect(result).toEqual(
    new FamilyDTO({
      id: mocks.defaultProps.id,
      name: mocks.defaultProps.name,
      ownerId: mocks.defaultProps.ownerId,
    }),
  );
});
