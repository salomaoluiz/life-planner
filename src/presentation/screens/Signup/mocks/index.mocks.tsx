import { render } from "@tests";

import useSignupViewModel from "../hooks/useSignupViewModel";
import Signup from "../index";

jest.mock("expo-router", () => ({ Redirect: "Redirect" }));
jest.mock("../hooks/useSignupViewModel");

// region mocks
const viewModel = {
  confirmPassword: "password123",
  confirmPasswordError: undefined as string | undefined,
  email: "test@example.com",
  emailError: undefined as string | undefined,
  formError: undefined as string | undefined,
  isSubmitting: false,
  logged: false,
  name: "Test User",
  nameError: undefined as string | undefined,
  onChangeConfirmPassword: jest.fn(),
  onChangeEmail: jest.fn(),
  onChangeName: jest.fn(),
  onChangePassword: jest.fn(),
  onEmailSubmit: jest.fn(),
  onGoToLogin: jest.fn(),
  onNameSubmit: jest.fn(),
  onPasswordSubmit: jest.fn(),
  onSubmit: jest.fn(),
  onTogglePassword: jest.fn(),
  password: "password123",
  passwordError: undefined as string | undefined,
  refs: {
    confirmPassword: { current: null },
    email: { current: null },
    password: { current: null },
  },
  showPassword: false,
};
// endregion mocks

// region spies
const spies = { useSignupViewModel: jest.mocked(useSignupViewModel) };
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(viewModel, {
    confirmPasswordError: undefined,
    emailError: undefined,
    formError: undefined,
    isSubmitting: false,
    logged: false,
    nameError: undefined,
    passwordError: undefined,
    showPassword: false,
  });
  spies.useSignupViewModel.mockReturnValue(viewModel as never);
});

function setup(overrides: Partial<typeof viewModel> = {}) {
  Object.assign(viewModel, overrides);
  render(<Signup />);
}

const mocks = { viewModel };

export { mocks, setup, spies };
