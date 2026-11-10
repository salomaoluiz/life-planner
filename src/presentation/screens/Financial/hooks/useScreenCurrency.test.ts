import { act, renderHook } from "@tests";

import { CurrencyCode } from "@domain/entities/financial/Currency";

import useScreenCurrency from "./useScreenCurrency";

function account(currency: CurrencyCode, status = "ACTIVE") {
  return { currency, status };
}

it("SHOULD stay hidden AND on BRL WHEN every active account is in BRL", () => {
  const { result } = renderHook(() =>
    useScreenCurrency([account("BRL"), account("BRL")]),
  );

  expect(result.current.visible).toBe(false);
  expect(result.current.currency).toBe("BRL");
  expect(result.current.options).toEqual(["BRL"]);
});

it("SHOULD show the dropdown WHEN there are active accounts in more than one currency, BRL first", () => {
  const { result } = renderHook(() =>
    useScreenCurrency([account("USD"), account("BRL"), account("EUR")]),
  );

  expect(result.current.visible).toBe(true);
  expect(result.current.options).toEqual(["BRL", "USD", "EUR"]);
});

it("SHOULD ignore archived accounts WHEN listing the currencies", () => {
  const { result } = renderHook(() =>
    useScreenCurrency([account("BRL"), account("USD", "ARCHIVED")]),
  );

  expect(result.current.visible).toBe(false);
  expect(result.current.options).toEqual(["BRL"]);
});

it("SHOULD keep the chosen currency AND fall back to BRL WHEN it loses its last active account", () => {
  const both = [account("BRL"), account("USD")];
  let accounts = both;
  const { rerender, result } = renderHook(() => useScreenCurrency(accounts));

  act(() => result.current.setCurrency("USD"));
  expect(result.current.currency).toBe("USD");

  accounts = [account("BRL"), account("USD", "ARCHIVED")];
  rerender({});
  expect(result.current.currency).toBe("BRL");

  accounts = both;
  rerender({});
  expect(result.current.currency).toBe("USD");
});
