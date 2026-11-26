import { renderHook } from "@testing-library/react-native";

import { useCases } from "@application/useCases";
import { useQuery } from "@infrastructure/fetcher";

import useUnreadCount from "./useUnreadCount";

jest.mock("@infrastructure/fetcher");
jest.mock("@application/useCases", () => ({
  useCases: { getUnreadNotificationCountUseCase: { execute: jest.fn() } },
}));

it("SHOULD expose the count AND read it through the use case", async () => {
  jest
    .mocked(useQuery)
    .mockReturnValue({ data: 3, refetch: jest.fn() } as never);
  jest
    .mocked(useCases.getUnreadNotificationCountUseCase.execute)
    .mockResolvedValue(3);

  const { result } = renderHook(() => useUnreadCount());
  const options = jest.mocked(useQuery).mock.calls[0][0];

  expect(result.current.count).toBe(3);
  expect(options.cacheKey).toEqual(["notification", "unread"]);
  expect(await options.fetch()).toBe(3);
});

it("SHOULD count 0 before the first answer", () => {
  jest
    .mocked(useQuery)
    .mockReturnValue({ data: undefined, refetch: jest.fn() } as never);

  expect(renderHook(() => useUnreadCount()).result.current.count).toBe(0);
});
