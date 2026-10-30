import { render } from "@tests";

import useLoginViewModel from "../hooks/useLoginViewModel";
import Login from "../index";

jest.mock("expo-router", () => ({ Redirect: "Redirect" }));
jest.mock("../hooks/useLoginViewModel");
jest.mock("../components/VersionLine", () => {
  const { View: MockView } = jest.requireActual("react-native");
  return { __esModule: true, default: () => <MockView testID="versions" /> };
});

// region mocks
const viewModel = {
  accountDeletedNotice: undefined as string | undefined,
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
  password: "password123",
  passwordError: undefined as string | undefined,
  passwordRef: { current: null },
};
// endregion mocks

// region spies
const spies = { useLoginViewModel: jest.mocked(useLoginViewModel) };
// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(viewModel, {
    accountDeletedNotice: undefined,
    emailError: undefined,
    formError: undefined,
    isSubmitting: false,
    logged: false,
  });
  spies.useLoginViewModel.mockReturnValue(viewModel as never);
});

function setup(overrides: Partial<typeof viewModel> = {}) {
  Object.assign(viewModel, overrides);
  render(<Login />);
}

export { mocks, setup, spies };
const mocks = { viewModel };
