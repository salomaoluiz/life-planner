import { render } from "@tests";

import * as hooks from "@presentation/screens/Login/hooks";

import Login from "../";

jest.mock("@presentation/screens/Login/hooks/useLogin");

// region mocks
const useLoginMock = {
  isFetching: false,
  onGoogleButtonPress: jest.fn(),
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

export { mocks, setup, spies };
export { fireEvent, screen } from "@tests";
