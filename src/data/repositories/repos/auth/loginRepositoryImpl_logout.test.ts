import { setup, spies } from "./mocks/loginRepositoryImpl_logout";

it("SHOULD logout", async () => {
  await setup();

  expect(spies.logout).toHaveBeenCalledTimes(1);
});
