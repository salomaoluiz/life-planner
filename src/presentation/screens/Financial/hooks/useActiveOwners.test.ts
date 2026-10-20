import { renderHook } from "@tests";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useQuery } from "@infrastructure/fetcher";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";

import useActiveOwners from "./useActiveOwners";

jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: { getOwnersUseCase: { execute: jest.fn(), uniqueName: "owners" } },
}));

const owners = [
  new OwnerDTO({ id: "user-id", name: "Test", type: OwnerType.USER }),
  new OwnerDTO({
    archived: true,
    id: "old-family",
    name: "Old",
    type: OwnerType.FAMILY,
  }),
];

it("SHOULD share the owners cache entry AND leave the archived families out", () => {
  const query = new UseQueryFixture<OwnerDTO[]>();
  jest
    .mocked(useQuery)
    .mockReturnValue(query.withData(owners).build() as never);

  const { result } = renderHook(() => useActiveOwners());

  expect(jest.mocked(useQuery).mock.calls[0][0].cacheKey).toEqual(["owners"]);
  expect(result.current.data?.map((owner) => owner.id)).toEqual(["user-id"]);
});

it("SHOULD keep the data undefined while loading", () => {
  jest
    .mocked(useQuery)
    .mockReturnValue(new UseQueryFixture<OwnerDTO[]>().build() as never);

  const { result } = renderHook(() => useActiveOwners());

  expect(result.current.data).toBeUndefined();
});
