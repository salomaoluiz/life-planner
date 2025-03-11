import { setup, spies } from "./mocks/setUser.mocks";

it("SHOULD set tag", () => {
  setup({
    id: "66d3d177-7d66-4d19-9742-ecb283ca829e",
  });

  expect(spies.setUser).toHaveBeenCalledTimes(1);
  expect(spies.setUser).toHaveBeenCalledWith({
    id: "66d3d177-7d66-4d19-9742-ecb283ca829e",
  });
});
