import * as reactQuery from "@infrastructure/fetcher/reactQuery";
import * as monitoring from "@infrastructure/monitoring";
import { renderHook } from "@tests";
import { useMutation } from "@infrastructure/fetcher";
import { BusinessError } from "@domain/entities/errors";

jest.mock("@infrastructure/fetcher/reactQuery");

// region Mocks

const successResponse = {
  data: {
    value: "success",
  },
  error: null,
  mutate: jest.fn(),
  variables: {
    var1: "variable1",
  },
  status: "success",
};

const error = new Error("Error message");
error.stack = "Error stack";

const errorResponse = {
  data: null,
  error,
  mutate: jest.fn(),
  variables: {
    var1: "variable1",
  },
  status: "error",
};

const businessErrorResponse = {
  data: null,
  error: new BusinessError(),
  mutate: jest.fn(),
  variables: {
    var1: "variable1",
  },
  status: "error",
};

const errorWithoutMessageResponse = {
  data: null,
  error: new Error(),
  mutate: jest.fn(),
  variables: {
    var1: "variable1",
  },
  status: "error",
};

const pendingResponse = {
  data: null,
  error: null,
  mutate: jest.fn(),
  variables: {
    var1: "variable1",
  },
  status: "pending",
};

const idleResponse = {
  data: null,
  error: null,
  mutate: jest.fn(),
  variables: {
    var1: "variable1",
  },
  status: "idle",
};

// endregion

const useReactMutationSpy = jest.spyOn(reactQuery, "useReactMutation");
const captureExceptionSpy = jest.spyOn(monitoring, "captureException");
const fetchSpy = jest.fn();

function setup(props: Parameters<typeof useMutation>[0]) {
  return renderHook(() => useMutation(props));
}

const spies = {
  useReactMutation: useReactMutationSpy,
  captureException: captureExceptionSpy,
  fetch: fetchSpy,
};

const mocks = {
  successResponse,
  errorResponse,
  businessErrorResponse,
  errorWithoutMessageResponse,
  pendingResponse,
  idleResponse,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { setup, spies, mocks };
