import { GenericError } from "@domain/entities/errors";
import useQuery from "@infrastructure/fetcher/useQuery";

type Return<R> = ReturnType<typeof useQuery<R>>;

class UseQueryFixture<Response> {
  value: Return<Response> = {
    data: undefined,
    error: null,
    isFetching: false,
    refetch: jest.fn(),
    status: "pending",
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
      refetch: jest.fn(),
      status: "pending",
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

  withStatus(status: Return<Response>["status"]) {
    this.value.status = status;
    return this;
  }
}

export default UseQueryFixture;
