import { render } from "@tests";

import useDeleteAccountViewModel from "../hooks/useDeleteAccountViewModel";
import DeleteAccount from "../index";

jest.mock("../hooks/useDeleteAccountViewModel");

// region mocks
const viewModel = {
  canSubmit: false,
  email: "",
  hasError: false,
  isDeleting: false,
  isLoadingFamilies: false,
  mismatch: false,
  onCancel: jest.fn(),
  onChangeEmail: jest.fn(),
  onContinue: jest.fn(),
  onPress: jest.fn(),
  onSubmit: jest.fn(),
  ownedFamilies: "",
  step: "closed" as "closed" | "confirm" | "email",
  userEmail: "test@example.com",
};
const defaults = { ...viewModel };
// endregion mocks

const spies = {
  useDeleteAccountViewModel: jest.mocked(useDeleteAccountViewModel),
};

beforeEach(() => {
  jest.clearAllMocks();
  Object.assign(viewModel, defaults);
  spies.useDeleteAccountViewModel.mockReturnValue(viewModel as never);
});

function setup(overrides: Partial<typeof viewModel> = {}) {
  Object.assign(viewModel, overrides);
  render(<DeleteAccount />);
}

const mocks = { viewModel };

export { mocks, setup, spies };
