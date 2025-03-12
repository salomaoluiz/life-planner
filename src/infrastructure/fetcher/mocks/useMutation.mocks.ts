import { BusinessError } from "@domain/entities/errors";
import { useMutation } from "@infrastructure/fetcher";
import * as reactQuery from "@infrastructure/fetcher/reactQuery";
import * as monitoring from "@infrastructure/monitoring";
import { renderHook } from "@tests";

jest.mock("@infrastructure/fetcher/reactQuery");

// region Mocks

const successResponse = {
  data: {
    value: "success",
  },
  error: null,
  mutate: jest.fn(),
  status: "success",
  variables: {
    var1: "variable1",
  },
};

const error = new Error("Error message");
error.stack = "Error stack";

const errorResponse = {
  data: null,
  error,
  mutate: jest.fn(),
  status: "error",
  variables: {
    var1: "variable1",
  },
};

const businessErrorResponse = {
  data: null,
  error: new BusinessError(),
  mutate: jest.fn(),
  status: "error",
  variables: {
    var1: "variable1",
  },
};

const errorWithoutMessageResponse = {
  data: null,
  error: new Error(),
  mutate: jest.fn(),
  status: "error",
  variables: {
    var1: "variable1",
  },
};

const pendingResponse = {
  data: null,
  error: null,
  mutate: jest.fn(),
  status: "pending",
  variables: {
    var1: "variable1",
  },
};

const idleResponse = {
  data: null,
  error: null,
  mutate: jest.fn(),
  status: "idle",
  variables: {
    var1: "variable1",
  },
};

// endregion

const useReactMutationSpy = jest.spyOn(reactQuery, "useReactMutation");
const captureExceptionSpy = jest.spyOn(monitoring, "captureException");
const fetchSpy = jest.fn();

function setup(props: Parameters<typeof useMutation>[0]) {
  return renderHook(() => useMutation(props));
}

const spies = {
  captureException: captureExceptionSpy,
  fetch: fetchSpy,
  useReactMutation: useReactMutationSpy,
};

const mocks = {
  businessErrorResponse,
  errorResponse,
  errorWithoutMessageResponse,
  idleResponse,
  pendingResponse,
  successResponse,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
