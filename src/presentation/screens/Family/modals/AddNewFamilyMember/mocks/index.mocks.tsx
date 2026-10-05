import { fireEvent, render, screen } from "@tests";

import AddNewFamilyMemberModal from "../";
import useAddNewFamilyMemberViewModel from "../hooks/useAddNewFamilyMemberViewModel";

jest.mock("../hooks/useAddNewFamilyMemberViewModel");

const spies = {
  onChangeEmail: jest.fn(),
  onClose: jest.fn(),
  onCopy: jest.fn(),
  onDone: jest.fn(),
  onShare: jest.fn(),
  onSubmit: jest.fn(),
  useViewModel: jest.mocked(useAddNewFamilyMemberViewModel),
};

function setup(
  overrides: Partial<ReturnType<typeof useAddNewFamilyMemberViewModel>> = {},
) {
  spies.useViewModel.mockReturnValue({
    copied: false,
    email: "",
    emailErrorKey: undefined,
    familyName: "Test Family",
    hasGenericError: false,
    isSubmitting: false,
    link: undefined,
    onChangeEmail: spies.onChangeEmail,
    onClose: spies.onClose,
    onCopy: spies.onCopy,
    onDone: spies.onDone,
    onShare: spies.onShare,
    onSubmit: spies.onSubmit,
    resultEmail: "",
    shareAvailable: true,
    ...overrides,
  });

  render(<AddNewFamilyMemberModal />);
}

export { hasText } from "@tests";
export { fireEvent, screen, setup, spies };
