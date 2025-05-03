import { GenericError } from "@domain/entities/errors";
import useMutation from "@infrastructure/fetcher/useMutation";

type Return = ReturnType<typeof useMutation>;

class UseMutationFixture {
  value: Return = {
    data: null,
    error: null,
    isFetching: false,
    mutate: jest.fn(),
    status: "idle",
  };

  build() {
    return {
      ...this.value,
    };
  }

  reset() {
    this.value = {
      data: null,
      error: null,
      isFetching: false,
      mutate: jest.fn(),
      status: "idle",
    };
    return this;
  }

  withData(data: object) {
    this.value.data = data;
    return this;
  }

  withError(error: GenericError = new GenericError()) {
    this.value.error = error;
    return this;
  }

  withIsFetching(isFetching: boolean) {
    this.value.isFetching = isFetching;
    return this;
  }

  withStatus(status: Return["status"]) {
    this.value.status = status;
    return this;
  }
}

export default UseMutationFixture;
