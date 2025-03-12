import { BusinessError } from "@domain/entities/errors";
import { useQuery } from "@infrastructure/fetcher";
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
  isFetching: false,
  refetch: jest.fn(),
  status: "success",
} as never;

const error = new Error("Error message");
error.stack = "Error stack";

const errorResponse = {
  data: null,
  error,
  isFetching: false,
  refetch: jest.fn(),
  status: "error",
} as never;

const businessErrorResponse = {
  data: null,
  error: new BusinessError(),
  isFetching: false,
  refetch: jest.fn(),
  status: "error",
} as never;

const errorWithoutMessageResponse = {
  data: null,
  error: new Error(),
  isFetching: false,
  refetch: jest.fn(),
  status: "error",
} as never;

const pendingResponse = {
  data: null,
  error: null,
  isFetching: true,
  refetch: jest.fn(),
  status: "pending",
};

// endregion

const useReactQuerySpy = jest.spyOn(reactQuery, "useReactQuery");
const captureExceptionSpy = jest.spyOn(monitoring, "captureException");
const fetchSpy = jest.fn();

function setup(props: Parameters<typeof useQuery>[0]) {
  return renderHook(() => useQuery(props));
}

const spies = {
  captureException: captureExceptionSpy,
  fetch: fetchSpy,
  useReactQuery: useReactQuerySpy,
};

const mocks = {
  businessErrorResponse,
  errorResponse,
  errorWithoutMessageResponse,
  pendingResponse,
  successResponse,
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { mocks, setup, spies };
