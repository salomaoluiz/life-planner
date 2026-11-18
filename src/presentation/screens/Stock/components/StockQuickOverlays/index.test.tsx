import { fireEvent, render, screen } from "@tests";

import { StockUnits } from "@domain/entities/stock/StockEntity";
import { StockLotStatus } from "@domain/entities/stock/StockLotEntity";
import { quickMock } from "@screens/Stock/mocks/index.mocks";
import { dto } from "@screens/Stock/models/stockUi.fixtures";
import stockTestIds from "@screens/Stock/testIds";

import StockQuickOverlays, { OfflineBanner } from "./index";

jest.mock(
  "react-native-safe-area-context",
  () => jest.requireActual("react-native-safe-area-context/jest/mock").default,
);

const item = dto((f) =>
  f
    .withId("rice")
    .withDescription("Arroz")
    .withUnit(StockUnits.KILOGRAM)
    .withQuantity(2),
);

function renderOverlays(overrides: Record<string, unknown> = {}) {
  const quick = quickMock(overrides);

  render(<StockQuickOverlays quick={quick as never} />);

  return quick;
}

it("SHOULD show Desfazer and Validade on a sent + notice AND call them", () => {
  const quick = renderOverlays({
    notice: {
      canSetExpiration: true,
      gestureId: "g",
      id: 1,
      itemId: "rice",
      kind: "MOVE",
      message: "Arroz +2",
      sent: true,
    },
  });

  expect(screen.getByText("Arroz +2")).toBeTruthy();

  fireEvent.press(screen.getByTestId(stockTestIds.noticeUndo));
  fireEvent.press(screen.getByTestId(stockTestIds.noticeExpiration));

  expect(quick.onUndo).toHaveBeenCalled();
  expect(quick.onExpirationOpen).toHaveBeenCalled();
});

it("SHOULD show no actions on an error notice", () => {
  renderOverlays({
    notice: {
      canSetExpiration: false,
      gestureId: "g",
      id: 1,
      itemId: "rice",
      kind: "ERROR",
      message: "stock.offline.reasonGone",
      sent: true,
    },
  });

  expect(screen.queryByTestId(stockTestIds.noticeUndo)).toBeNull();
});

it("SHOULD offer the exact quantity chips AND confirm the typed amount", () => {
  const quick = renderOverlays({ exact: { direction: -1, item } });

  expect(screen.getByTestId(stockTestIds.exactSheet)).toBeTruthy();
  expect(
    screen.getByTestId(`${stockTestIds.exactSheet}-chips-0.5`),
  ).toBeTruthy();

  fireEvent.press(screen.getByTestId(`${stockTestIds.exactSheet}-chips-0.5`));
  fireEvent.press(screen.getByTestId(stockTestIds.exactConfirm));

  expect(quick.onExactConfirm).toHaveBeenCalledWith(-1, 0.5);
});

describe("expired lot question", () => {
  const lots = [
    { expirationStatus: StockLotStatus.EXPIRED, id: "a", quantity: 1 },
    { expirationStatus: StockLotStatus.OK, id: "b", quantity: 2 },
  ];

  it("SHOULD show the three options WHEN a valid lot exists", () => {
    const quick = renderOverlays({
      expiredPrompt: { item, lots },
      hasExpiredValidLot: jest.fn().mockReturnValue(true),
    });

    expect(
      screen.getByTestId(`${stockTestIds.expiredOption}-DISCARD_THEN_VALID`),
    ).toBeTruthy();
    expect(
      screen.getByTestId(`${stockTestIds.expiredOption}-VALID_ONLY`),
    ).toBeTruthy();

    fireEvent.press(
      screen.getByTestId(`${stockTestIds.expiredOption}-EXPIRED_FIRST`),
    );

    expect(quick.onChooseExpired).toHaveBeenCalledWith("EXPIRED_FIRST");
  });

  it("SHOULD show only discard and use-expired WHEN every lot is expired", () => {
    renderOverlays({
      expiredPrompt: { item, lots: [lots[0]] },
      hasExpiredValidLot: jest.fn().mockReturnValue(false),
    });

    expect(
      screen.queryByTestId(`${stockTestIds.expiredOption}-VALID_ONLY`),
    ).toBeNull();
    expect(
      screen.getByTestId(`${stockTestIds.expiredOption}-DISCARD_THEN_VALID`),
    ).toBeTruthy();
    expect(
      screen.getByTestId(`${stockTestIds.expiredOption}-EXPIRED_FIRST`),
    ).toBeTruthy();
  });

  it("SHOULD cancel without writing", () => {
    const quick = renderOverlays({ expiredPrompt: { item, lots } });

    fireEvent.press(screen.getByTestId(stockTestIds.expiredCancel));

    expect(quick.onExpiredCancel).toHaveBeenCalled();
  });
});

it("SHOULD count the queued movements in the offline banner", () => {
  render(<OfflineBanner quick={quickMock({ offlineCount: 3 }) as never} />);

  expect(screen.getByTestId(stockTestIds.offlineBanner)).toBeTruthy();
});

it("SHOULD render no banner WHEN nothing is queued", () => {
  render(<OfflineBanner quick={quickMock() as never} />);

  expect(screen.queryByTestId(stockTestIds.offlineBanner)).toBeNull();
});
