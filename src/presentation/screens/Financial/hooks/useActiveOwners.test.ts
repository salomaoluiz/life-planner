import { renderHook } from "@tests";

import OwnerDTO from "@application/dto/user/OwnerDTO";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import UseQueryFixture from "@infrastructure/fetcher/mocks/useQuery.fixture";
import useOwners from "@presentation/hooks/useOwners";

import useActiveOwners from "./useActiveOwners";

jest.mock("@presentation/hooks/useOwners");

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
    .mocked(useOwners)
    .mockReturnValue(query.withData(owners).build() as never);

  const { result } = renderHook(() => useActiveOwners());

  expect(useOwners).toHaveBeenCalledTimes(1);
  expect(result.current.data?.map((owner) => owner.id)).toEqual(["user-id"]);
});

it("SHOULD keep the data undefined while loading", () => {
  jest
    .mocked(useOwners)
    .mockReturnValue(new UseQueryFixture<OwnerDTO[]>().build() as never);

  const { result } = renderHook(() => useActiveOwners());

  expect(result.current.data).toBeUndefined();
});
