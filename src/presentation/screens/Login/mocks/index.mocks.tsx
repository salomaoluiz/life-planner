import { render } from "@tests";

import useLoginViewModel from "../hooks/useLoginViewModel";
import Login from "../index";

jest.mock("expo-router", () => ({ Redirect: "Redirect" }));
jest.mock("../hooks/useLoginViewModel");

// region mocks
const viewModel = {
  email: "test@example.com",
  emailError: undefined as string | undefined,
  formError: undefined as
    | undefined
    | { message: string; type: "error" | "info" },
  isSubmitting: false,
  logged: false,
  onChangeEmail: jest.fn(),
  onChangePassword: jest.fn(),
  onEmailSubmit: jest.fn(),
  onGoToSignUp: jest.fn(),
  onSubmit: jest.fn(),
  onTogglePassword: jest.fn(),
  password: "password123",
  passwordError: undefined as string | undefined,
  passwordRef: { current: null },
  showPassword: false,
};
// endregion mocks

// region spies
const spies = { useLoginViewModel: jest.mocked(useLoginViewModel) };
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(viewModel, {
    emailError: undefined,
    formError: undefined,
    isSubmitting: false,
    logged: false,
    showPassword: false,
  });
  spies.useLoginViewModel.mockReturnValue(viewModel as never);
});

function setup(overrides: Partial<typeof viewModel> = {}) {
  Object.assign(viewModel, overrides);
  render(<Login />);
}

export { mocks, setup, spies };
const mocks = { viewModel };
