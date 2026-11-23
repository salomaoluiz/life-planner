import { router } from "expo-router";

import { fireEvent, render, screen, waitFor } from "@tests";

import { useCases } from "@application/useCases";
import { PurchaseStatuses } from "@domain/entities/stock/PurchaseEntity";
import { invalidateFetcherData, useQuery } from "@infrastructure/fetcher";
import homeTestIds from "@screens/Home/testIds";

import PendingPurchaseBanner from "./";

jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("@infrastructure/fetcher");
jest.mock("@presentation/i18n", () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) =>
      params ? `${key}:${JSON.stringify(params)}` : key,
  }),
  useTranslationLocale: () => ({ getLocale: () => ({ languageTag: "en-US" }) }),
}));
jest.mock("@application/useCases", () => ({
  useCases: {
    changePurchaseStatusUseCase: { execute: jest.fn(), uniqueName: "change" },
    getPendingPurchasesUseCase: { execute: jest.fn(), uniqueName: "pending" },
  },
}));

const entry = {
  cartTotalCents: 500,
  checkedCount: 2,
  id: "p1",
  lastActivityAt: "2026-11-17T10:00:00.000Z",
  listId: "l1",
  listName: "Mercado",
  marketName: "Atacadão",
  status: PurchaseStatuses.OPEN,
};

function givenPending(data?: unknown[]) {
  jest.mocked(useQuery).mockReturnValue({ data } as never);
}

beforeEach(() => jest.clearAllMocks());

it("SHOULD render nothing without pending purchases", () => {
  givenPending([]);
  render(<PendingPurchaseBanner />);

  expect(screen.queryByTestId(homeTestIds.pendingPurchases)).toBeNull();
});

it("SHOULD remind a forgotten purchase AND open it to close", () => {
  givenPending([entry]);
  render(<PendingPurchaseBanner />);

  fireEvent.press(screen.getByTestId(`${homeTestIds.pendingPurchaseClose}-p1`));

  expect(router.push).toHaveBeenCalledWith("/stock/purchases/p1");
});

it("SHOULD show an ended purchase as waiting to be closed", () => {
  givenPending([{ ...entry, status: PurchaseStatuses.ENDED }]);
  render(<PendingPurchaseBanner />);

  expect(screen.getByTestId(homeTestIds.pendingPurchases)).toBeTruthy();
});

it("SHOULD ask before discarding a purchase with checked rows AND discard on confirm", async () => {
  givenPending([entry]);
  render(<PendingPurchaseBanner />);

  fireEvent.press(
    screen.getByTestId(`${homeTestIds.pendingPurchaseDiscard}-p1`),
  );
  fireEvent.press(
    screen.getByTestId(`${homeTestIds.pendingPurchaseConfirm}-confirm`),
  );

  await waitFor(() =>
    expect(useCases.changePurchaseStatusUseCase.execute).toHaveBeenCalledWith({
      action: "DISCARD",
      id: "p1",
    }),
  );
  expect(invalidateFetcherData).toHaveBeenCalled();
});

it("SHOULD discard at once WHEN nothing is checked", async () => {
  givenPending([{ ...entry, checkedCount: 0 }]);
  render(<PendingPurchaseBanner />);

  fireEvent.press(
    screen.getByTestId(`${homeTestIds.pendingPurchaseDiscard}-p1`),
  );

  await waitFor(() =>
    expect(useCases.changePurchaseStatusUseCase.execute).toHaveBeenCalledWith({
      action: "DISCARD",
      id: "p1",
    }),
  );
});
