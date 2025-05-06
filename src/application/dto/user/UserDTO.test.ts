import UserDTO from "@application/dto/user/UserDTO";

import { mocks, setupFromEntity } from "./mocks/UserDTO.mocks";

it("SHOULD render correctly from entity", () => {
  const result = setupFromEntity();

  expect(result).toEqual(
    new UserDTO({
      email: mocks.defaultProps.email,
      id: mocks.defaultProps.id,
      name: mocks.defaultProps.name,
      photoUrl: mocks.defaultProps.photoUrl,
    }),
  );
});
