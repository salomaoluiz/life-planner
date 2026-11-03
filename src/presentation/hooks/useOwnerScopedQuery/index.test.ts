import { renderHook } from "@tests";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { GenericError } from "@domain/entities/errors";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import useOwners from "@presentation/hooks/useOwners";

import useOwnerScopedQuery from "./index";

jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/hooks/useOwners");

const owners = [
  new OwnerDTO({ id: "user-id", name: "Test", type: OwnerType.USER }),
  new OwnerDTO({ id: "family-1", name: "Family", type: OwnerType.FAMILY }),
];

const ownersQuery = new UseQueryFixture<OwnerDTO[]>();
const dataQuery = new UseQueryFixture<string>();
const fetchData = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  ownersQuery.reset();
  dataQuery.reset();
  jest.mocked(useOwners).mockImplementation(() => ownersQuery.build());
  jest.mocked(useQuery).mockImplementation((() => dataQuery.build()) as never);
});

function queryOptions() {
  return jest.mocked(useQuery).mock.lastCall![0];
}

function setup() {
  return renderHook(() =>
    useOwnerScopedQuery<string>({ cacheKey: ["list"], fetch: fetchData }),
  );
}

it("SHOULD stay disabled WHILE the owners are loading", () => {
  setup();

  expect(queryOptions().enabled).toBe(false);
});

it("SHOULD enable the query AND key it by the owner ids WHEN the owners are known", () => {
  ownersQuery.withData(owners);

  setup();

  expect(queryOptions().enabled).toBe(true);
  expect(queryOptions().cacheKey).toEqual(["list", "user-id", "family-1"]);
});

it("SHOULD stay disabled WHEN the caller disables it", () => {
  ownersQuery.withData(owners);

  renderHook(() =>
    useOwnerScopedQuery<string>({
      cacheKey: ["list"],
      enabled: false,
      fetch: fetchData,
    }),
  );

  expect(queryOptions().enabled).toBe(false);
});

it("SHOULD fetch with the owners", async () => {
  ownersQuery.withData(owners);
  fetchData.mockResolvedValue("data");
  setup();

  await expect(queryOptions().fetch()).resolves.toBe("data");

  expect(fetchData).toHaveBeenCalledWith(owners);
});

it("SHOULD expose the owners error WHEN the owners failed (no endless loading)", () => {
  const error = new GenericError();
  ownersQuery.withError(error).withStatus("error");

  const { result } = setup();

  expect(result.current.error).toBe(error);
  expect(result.current.status).toBe("error");
});

it("SHOULD expose the data of the query", () => {
  ownersQuery.withData(owners);
  dataQuery.withData("data").withStatus("success");

  const { result } = setup();

  expect(result.current.data).toBe("data");
  expect(result.current.status).toBe("success");
});

it("SHOULD report fetching WHILE the owners are fetching", () => {
  ownersQuery.withIsFetching(true);

  const { result } = setup();

  expect(result.current.isFetching).toBe(true);
});

it("SHOULD refetch only the owners WHEN they are not known yet", async () => {
  const { result } = setup();

  await result.current.refetch();

  expect(ownersQuery.value.refetch).toHaveBeenCalledTimes(1);
  expect(dataQuery.value.refetch).not.toHaveBeenCalled();
});

it("SHOULD refetch the owners AND the data WHEN the owners are known", async () => {
  ownersQuery.withData(owners);
  const { result } = setup();

  await result.current.refetch({ throwOnError: true });

  expect(ownersQuery.value.refetch).toHaveBeenCalledWith({
    throwOnError: true,
  });
  expect(dataQuery.value.refetch).toHaveBeenCalledWith({ throwOnError: true });
});
