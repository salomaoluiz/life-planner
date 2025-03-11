import { listUseCases } from "./index";

const useCases = {
  getUserUseCase: expect.any(Function),
  loginWithGoogleUseCase: expect.any(Function),
  logoutUseCase: expect.any(Function),
  saveWebSessionUseCase: expect.any(Function),
};

it("SHOULD return a list of use cases", () => {
  expect(listUseCases).toEqual(useCases);
});
