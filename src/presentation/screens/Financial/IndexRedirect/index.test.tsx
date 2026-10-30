import { Redirect } from "expo-router";

import { render } from "@tests";

import FinancialIndexRedirect from "./";

jest.mock("expo-router", () => ({ Redirect: jest.fn(() => null) }));

it("SHOULD redirect /financial to /financial/transaction", () => {
  render(<FinancialIndexRedirect />);

  expect(jest.mocked(Redirect).mock.calls[0][0]).toEqual({
    href: "/financial/transaction",
  });
});
