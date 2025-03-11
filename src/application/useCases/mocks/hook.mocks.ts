import { renderHook } from "@tests";
import useUseCases from "@application/useCases/hook";

// region mock

const executeSuccessResponse = { id: "1", name: "John Doe" };
const executeErrorResponse = new Error("Error executing use case");

// endregion mock

const executeUseCaseSpy = jest.fn();

function setup() {
  return renderHook(() => useUseCases({ execute: executeUseCaseSpy }));
}

const spies = {
  executeUseCase: executeUseCaseSpy,
};

const mocks = {
  execute: {
    successResponse: executeSuccessResponse,
    errorResponse: executeErrorResponse,
  },
};

beforeEach(() => {
  jest.clearAllMocks();
});

export { setup, spies, mocks };
export { act, suppressConsoleError } from "@tests";
