import * as hooks from "@presentation/screens/Login/hooks";
import { render } from "@tests";

import Login from "../index.web";

jest.mock("@presentation/screens/Login/hooks/useLogin");
jest.mock("@presentation/screens/Login/hooks/useSaveSession");

// region mocks
const useLoginMock = {
  isFetching: false,
  onGoogleButtonPress: jest.fn(),
};

const useSaveSessionMock = {
  error: null,
  isFetching: false,
};

// endregion mocks

// region spies

const useLoginSpy = jest.spyOn(hooks, "useLogin").mockReturnValue(useLoginMock);
const useSaveSessionSpy = jest
  .spyOn(hooks, "useSaveSession")
  .mockReturnValue(useSaveSessionMock);

// endregion spies

beforeEach(() => {
  jest.clearAllMocks();
});

function setup() {
  render(<Login />);
}

const spies = {
  useLogin: useLoginSpy,
  useSaveSession: useSaveSessionSpy,
};

const mocks = {
  useLogin: useLoginMock,
  useSaveSession: useSaveSessionMock,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
export { fireEvent, screen } from "@tests";
