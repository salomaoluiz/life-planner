import { render } from "@tests";
import Login from "../index.web";
import * as hooks from "@presentation/screens/Login/hooks";

jest.mock("@presentation/screens/Login/hooks/useLogin");
jest.mock("@presentation/screens/Login/hooks/useSaveSession");

// region mocks
const useLoginMock = {
  onGoogleButtonPress: jest.fn(),
  isFetching: false,
};

const useSaveSessionMock = {
  isFetching: false,
  error: null,
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

export { setup, spies, mocks };
export { screen, fireEvent } from "@tests";
