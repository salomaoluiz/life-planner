import { Datasources } from "@data/datasource";

import activityRepositoryImpl from "./activityRepositoryImpl";

const methods = ["getActivity", "getActivityItems"] as const;
const activityDatasource = Object.fromEntries(
  methods.map((method) => [method, jest.fn().mockResolvedValue(method)]),
) as Record<(typeof methods)[number], jest.Mock>;
const repository = activityRepositoryImpl({
  activityDatasource,
} as unknown as Datasources);

beforeEach(() => jest.clearAllMocks());

it.each(methods)("SHOULD forward %s to the datasource", async (method) => {
  const params = { id: "x" } as never;

  expect(await repository[method](params)).toBe(method);
  expect(activityDatasource[method]).toHaveBeenCalledWith(params);
});
