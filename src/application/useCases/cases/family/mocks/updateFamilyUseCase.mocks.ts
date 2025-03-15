import { repositoriesMocks } from "@data/repositories/mocks";

import updateFamilyUseCase, {
  UpdateFamilyUseCaseParams,
} from "../updateFamilyUseCase";

// region mocks
const defaultProps = {
  id: "123",
  name: "New Family",
};
// endregion mocks

// region spies
const updateFamilySpy = jest.spyOn(
  repositoriesMocks.familyRepository,
  "updateFamily",
);

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

async function setup(props?: Partial<UpdateFamilyUseCaseParams>) {
  return updateFamilyUseCase(repositoriesMocks).execute({
    ...defaultProps,
    ...props,
  });
}

async function throwableSetup(props?: Partial<UpdateFamilyUseCaseParams>) {
  try {
    await setup(props);
  } catch (error) {
    return error;
  }
}
const spies = {
  updateFamily: updateFamilySpy,
};

const mocks = {
  defaultProps,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies, throwableSetup };
