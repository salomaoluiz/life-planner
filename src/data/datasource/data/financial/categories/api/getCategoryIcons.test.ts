import { ApiBusinessError, GenericError } from "@domain/entities/errors";
import { api } from "@infrastructure/api";

import getCategoryIcons from "./getCategoryIcons";

jest.mock("@infrastructure/api", () => ({
  api: { get: jest.fn() },
}));

const item = {
  common: true,
  group: "FOOD",
  labelEn: "Food",
  labelPt: "Comida",
  name: "food",
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.mocked(api.get).mockResolvedValue({ items: [item] });
});

it("SHOULD GET the whole catalog WHEN there is no query", async () => {
  const result = await getCategoryIcons({});

  expect(api.get).toHaveBeenCalledWith("/v1/finance/category-icons");
  expect(result).toEqual([item]);
});

it("SHOULD encode q (accents, spaces, symbols) and send the limit", async () => {
  await getCategoryIcons({ limit: 20, q: " água & luz " });

  expect(api.get).toHaveBeenCalledWith(
    "/v1/finance/category-icons?q=%C3%A1gua+%26+luz&limit=20",
  );
});

it("SHOULD omit a blank q", async () => {
  await getCategoryIcons({ q: "   " });

  expect(api.get).toHaveBeenCalledWith("/v1/finance/category-icons");
});

it("SHOULD wrap failures in GenericError", async () => {
  jest.mocked(api.get).mockRejectedValueOnce(new Error("offline"));
  await expect(getCategoryIcons({})).rejects.toBeInstanceOf(GenericError);

  jest
    .mocked(api.get)
    .mockRejectedValueOnce(new ApiBusinessError("Bad Request", 400));
  await expect(getCategoryIcons({ limit: 999 })).rejects.toBeDefined();
});
