import { setup, mocks, spies } from "./mocks/userRepositoryImpl_getUser";
import UserEntity from "@domain/entities/user/userEntity";

it("SHOULD get user", async () => {
  spies.getUser.mockResolvedValue(mocks.getUserSuccess);

  const result = await setup();

  expect(spies.getUser).toHaveBeenCalledTimes(1);
  expect(result).toEqual(
    new UserEntity({
      id: mocks.getUserSuccess.id,
      name: mocks.getUserSuccess.name,
      email: mocks.getUserSuccess.email,
      photoUrl: mocks.getUserSuccess.avatar,
    }),
  );
});
