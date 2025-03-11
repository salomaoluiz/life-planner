import { render } from "@tests";
import Login from "../";
import * as hooks from "@presentation/screens/Login/hooks";

jest.mock("@presentation/screens/Login/hooks/useLogin");

// region mocks
const useLoginMock = {
  onGoogleButtonPress: jest.fn(),
  isFetching: false,
};
// endregion mocks

// region spies

const useLoginSpy = jest.spyOn(hooks, "useLogin").mockReturnValue(useLoginMock);

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  render(<Login />);
}

const spies = {
  useLogin: useLoginSpy,
};

const mocks = {
  useLogin: useLoginMock,
};

export { setup, spies, mocks };
export { screen, fireEvent } from "@tests";
