import { fireEvent, render, screen } from "@tests";

import AddNewFamilyModal from "../";
import useAddNewFamilyViewModel from "../hooks/useAddNewFamilyViewModel";

jest.mock("../hooks/useAddNewFamilyViewModel", () => ({
  __esModule: true,
  default: jest.fn(),
  FAMILY_NAME_MAX: 50,
}));

const spies = {
  onChangeName: jest.fn(),
  onClose: jest.fn(),
  onSubmit: jest.fn(),
  useViewModel: jest.mocked(useAddNewFamilyViewModel),
};

function setup(
  overrides: Partial<ReturnType<typeof useAddNewFamilyViewModel>> = {},
) {
  spies.useViewModel.mockReturnValue({
    counterVisible: false,
    errorKey: undefined,
    hasGenericError: false,
    isSubmitting: false,
    name: "",
    onChangeName: spies.onChangeName,
    onClose: spies.onClose,
    onSubmit: spies.onSubmit,
    ...overrides,
  });

  render(<AddNewFamilyModal />);
}

export { hasText } from "@tests";
export { fireEvent, screen, setup, spies };
