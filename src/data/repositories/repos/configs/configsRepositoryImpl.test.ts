import { setup, spies } from "./mocks/configsRepositoryImpl.mocks";

it("SHOULD call getConfigs correctly", async () => {
  const repository = setup();
  const result = await repository.getConfigs();

  expect(result).toEqual("getConfigs response");
  expect(spies.getConfigs).toHaveBeenCalledTimes(1);
  expect(spies.getConfigs).toHaveBeenCalledWith();
});

it("SHOULD call saveConfigs correctly", async () => {
  const repository = setup();
  const result = await repository.saveConfigs({
    darkMode: true,
    language: "en-US",
  });

  expect(result).toEqual("saveConfigs response");
  expect(spies.saveConfigs).toHaveBeenCalledTimes(1);
  expect(spies.saveConfigs).toHaveBeenCalledWith({
    darkMode: true,
    language: "en-US",
  });
});
