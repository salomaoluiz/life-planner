import { injectionUseCaseSetup, cases, repositories } from "./mocks";

it("SHOULD return an object with the use cases", () => {
  const useCases = injectionUseCaseSetup();

  expect(Object.keys(useCases)).toEqual(Object.keys(cases));
});

it("SHOULD call the use case with the repositories", () => {
  injectionUseCaseSetup();

  Object.values(cases).forEach((useCase) => {
    expect(useCase).toHaveBeenCalledWith(repositories);
  });
});
