import { makeDetail, makeOperation } from "@screens/Investment/mocks/fixtures";

import { deleteSummary, sellCount } from "./detailModel";

it("SHOULD count the operations and the linked finance entries", () => {
  const detail = makeDetail({
    operations: [
      makeOperation({ id: "a" }),
      makeOperation({ id: "b", transactionId: null }),
    ],
  });

  expect(deleteSummary(detail)).toEqual({ entries: 1, operations: 2 });
});

it("SHOULD count the sells", () => {
  expect(sellCount(makeDetail())).toBe(1);
});
