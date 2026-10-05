import { Pressable } from "react-native";

import { fireEvent, render, screen } from "@tests";

import AddNewFamilyMemberModal from "../";
import useAddNewFamilyMemberViewModel from "../hooks/useAddNewFamilyMemberViewModel";

jest.mock("../hooks/useAddNewFamilyMemberViewModel");
jest.mock("@presentation/i18n/useTranslation", () => ({
  __esModule: true,
  default: () => ({ t: (key: string) => key }),
}));

// region mocks
const viewModel = {
  alreadyExistsVisible: false,
  email: "",
  emailErrorKey: undefined as string | undefined,
  isSubmitting: false,
  onCancel: jest.fn(),
  onChangeEmail: jest.fn(),
  onSubmit: jest.fn(),
};
// endregion mocks

beforeEach(() => {
  jest.clearAllMocks();
});

function press(label: string) {
  fireEvent.press(screen.UNSAFE_getAllByProps({ label })[0]);
}

function setup(overrides?: Partial<typeof viewModel>) {
  const vm = { ...viewModel, ...overrides };
  jest.mocked(useAddNewFamilyMemberViewModel).mockReturnValue(vm as never);

  render(<AddNewFamilyMemberModal />);

  return vm;
}

const mocks = { Pressable };

export { mocks, press, setup };
export { hasText } from "@tests";
export { fireEvent, screen };
