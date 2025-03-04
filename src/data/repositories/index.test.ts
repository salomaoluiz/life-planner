import { injectionRepositorySetup, cases, datasourcesMocks } from "./mocks";

it("SHOULD return an object with the repository", () => {
  const repositories = injectionRepositorySetup();

  expect(Object.keys(repositories)).toEqual(Object.keys(cases));
});

it("SHOULD call the use case with the datasources", () => {
  injectionRepositorySetup();

  Object.values(cases).forEach((repositories) => {
    expect(repositories).toHaveBeenCalledWith(datasourcesMocks);
  });
});
