import { GenericError } from "@domain/entities/errors";
import useMutation from "@infrastructure/fetcher/useMutation";

type Return<Params, Response> = ReturnType<
  typeof useMutation<Params, Response>
>;

class UseMutationFixture<Params, Response> {
  value: Return<Params, Response> = {
    data: undefined,
    error: null,
    isFetching: false,
    mutate: jest.fn<Response, [Params]>(),
    status: "idle",
  };

  build() {
    return {
      ...this.value,
    };
  }

  reset() {
    this.value = {
      data: undefined,
      error: null,
      isFetching: false,
      mutate: jest.fn<Response, [Params]>(),
      status: "idle",
    };
    return this;
  }

  withData(data: Response) {
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

  withStatus(status: Return<Params, Response>["status"]) {
    this.value.status = status;
    return this;
  }
}

export default UseMutationFixture;
