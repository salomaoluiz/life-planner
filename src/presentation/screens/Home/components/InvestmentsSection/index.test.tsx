import { fireEvent, render, screen } from "@tests";

import { InvestmentsHomeSummary } from "@domain/entities/investment/InvestmentEntities";
import InvestmentsSummaryUIModel from "@screens/Home/models/InvestmentsSummaryUIModel";
import homeTestIds from "@screens/Home/testIds";

import InvestmentsSection from "./";

const now = new Date(2026, 10, 4, 18, 0);

function handlers() {
  return {
    canAddAsset: true,
    onAddAssetPress: jest.fn(),
    onMaturityPress: jest.fn(),
    onPortfolioPress: jest.fn(),
    onSuggestionsPress: jest.fn(),
  };
}

function ready(overrides: Partial<InvestmentsHomeSummary> = {}) {
  return {
    data: new InvestmentsSummaryUIModel(summary(overrides), now, "en-US"),
    isError: false,
    isLoading: false,
    onRetry: jest.fn(),
  };
}

function renderSection(
  state: Parameters<typeof InvestmentsSection>[0]["state"],
  props: Partial<Parameters<typeof InvestmentsSection>[0]> = {},
) {
  const base = handlers();

  render(
    <InvestmentsSection {...base} isSplitLayout state={state} {...props} />,
  );

  return base;
}

function summary(
  overrides: Partial<InvestmentsHomeSummary> = {},
): InvestmentsHomeSummary {
  return {
    currentValueCents: 18432055,
    hasPositions: true,
    income: {
      count: 6,
      month: "2026-11",
      pendingSuggestions: 2,
      totalCents: 128430,
    },
    investedCents: 16290000,
    nextMaturity: {
      assetId: "asset-1",
      currency: "BRL",
      maturityDate: "2026-12-15",
      name: "CDB",
      netEstimatedCents: 2187010,
    },
    quotes: {
      asOf: new Date(2026, 10, 4, 16, 5),
      manualCount: 2,
      stale: false,
      withoutPrice: 0,
    },
    resultBasisPoints: 1315,
    resultCents: 2142055,
    ...overrides,
  };
}

it("SHOULD render the skeleton WHILE loading", () => {
  renderSection({ isError: false, isLoading: true, onRetry: jest.fn() });

  expect(screen.getByTestId(homeTestIds.investmentsLoading)).toBeOnTheScreen();
});

it("SHOULD render the error with a retry that reloads only this section", () => {
  const onRetry = jest.fn();

  renderSection({ isError: true, isLoading: false, onRetry });
  fireEvent.press(screen.getByTestId(`${homeTestIds.investmentsError}-action`));

  expect(screen.getByText("home.investments.error")).toBeOnTheScreen();
  expect(onRetry).toHaveBeenCalledTimes(1);
});

describe("empty state", () => {
  const empty = ready({ hasPositions: false });

  it("SHOULD offer Add asset", () => {
    const { onAddAssetPress } = renderSection(empty);

    expect(screen.getByText("home.investments.empty.title")).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId(homeTestIds.investmentsAddAsset));

    expect(onAddAssetPress).toHaveBeenCalledTimes(1);
  });

  it("SHOULD hide Add asset WHEN the owner cannot add (archived family)", () => {
    renderSection(empty, { canAddAsset: false });

    expect(screen.getByTestId(homeTestIds.investmentsEmpty)).toBeOnTheScreen();
    expect(screen.queryByTestId(homeTestIds.investmentsAddAsset)).toBeNull();
  });
});

describe("populated, wide", () => {
  it("SHOULD show the value, the cost, the result with its percentage AND the quotes footer", () => {
    renderSection(ready());

    expect(
      screen.getByTestId(homeTestIds.investmentsCurrentValue),
    ).toHaveTextContent("R$184,320.55");
    expect(
      screen.getByTestId(homeTestIds.investmentsInvested),
    ).toBeOnTheScreen();
    expect(screen.getByTestId(homeTestIds.investmentsResult)).toBeOnTheScreen();
    expect(screen.getByText("+13.15%")).toBeOnTheScreen();
    expect(
      screen.getByTestId(homeTestIds.investmentsQuotesFooter),
    ).toHaveTextContent(
      'home.investments.quotesAsOf {"when":"home.investments.when.today {\\"date\\":\\"Nov 4\\",\\"time\\":\\"16:05\\"}"} · home.investments.manualCount_other {"count":2}',
    );
  });

  it("SHOULD open the module from the portfolio card", () => {
    const { onPortfolioPress } = renderSection(ready());

    fireEvent.press(screen.getByLabelText("home.investments.openLabel"));

    expect(onPortfolioPress).toHaveBeenCalledTimes(1);
  });

  it("SHOULD show the income, the suggestions link AND the next maturity", () => {
    const { onMaturityPress, onSuggestionsPress } = renderSection(ready());

    expect(screen.getByTestId(homeTestIds.investmentsIncome)).toHaveTextContent(
      "+ R$1,284.30",
    );
    fireEvent.press(screen.getByTestId(homeTestIds.investmentsSuggestions));
    fireEvent.press(screen.getByTestId(homeTestIds.investmentsNextMaturity));

    expect(onSuggestionsPress).toHaveBeenCalledTimes(1);
    expect(onMaturityPress).toHaveBeenCalledWith("asset-1");
    expect(screen.getByText("CDB")).toBeOnTheScreen();
  });

  it("SHOULD show the amber warning instead of the footer WHEN the quotes are stale", () => {
    renderSection(
      ready({
        quotes: {
          asOf: new Date(2026, 10, 3, 18, 0),
          manualCount: 0,
          stale: true,
          withoutPrice: 0,
        },
      }),
    );

    expect(
      screen.getByTestId(homeTestIds.investmentsQuotesFooter),
    ).toHaveTextContent(/home\.investments\.stale/);
  });

  it("SHOULD show a negative result with a minus sign", () => {
    renderSection(ready({ resultBasisPoints: -844, resultCents: -380000 }));

    expect(screen.getByText("−8.44%")).toBeOnTheScreen();
  });

  it("SHOULD show zero income, no suggestions link AND the no-maturity line", () => {
    renderSection(
      ready({
        income: {
          count: 0,
          month: "2026-11",
          pendingSuggestions: 0,
          totalCents: 0,
        },
        nextMaturity: undefined,
      }),
    );

    expect(screen.getByText("home.investments.noIncome")).toBeOnTheScreen();
    expect(screen.queryByTestId(homeTestIds.investmentsSuggestions)).toBeNull();
    expect(
      screen.queryByTestId(homeTestIds.investmentsNextMaturity),
    ).toBeNull();
    expect(screen.getByText("home.investments.noMaturity")).toBeOnTheScreen();
  });

  it("SHOULD say the maturity is today WHEN it matures today", () => {
    renderSection(
      ready({
        nextMaturity: {
          assetId: "a",
          currency: "BRL",
          maturityDate: "2026-11-04",
          name: "CDB",
          netEstimatedCents: 100,
        },
      }),
    );

    expect(
      screen.getByText('home.investments.dueToday {"date":"Nov 4, 2026"}'),
    ).toBeOnTheScreen();
  });
});

describe("populated, compact", () => {
  it("SHOULD render every block in one card AND keep the three press targets", () => {
    const { onMaturityPress, onPortfolioPress, onSuggestionsPress } =
      renderSection(ready(), { isSplitLayout: false });

    expect(
      screen.getByTestId(homeTestIds.investmentsCurrentValue),
    ).toBeOnTheScreen();
    expect(screen.getByTestId(homeTestIds.investmentsResult)).toBeOnTheScreen();
    expect(screen.getByTestId(homeTestIds.investmentsIncome)).toBeOnTheScreen();

    fireEvent.press(screen.getByLabelText("home.investments.openLabel"));
    fireEvent.press(screen.getByTestId(homeTestIds.investmentsSuggestions));
    fireEvent.press(screen.getByTestId(homeTestIds.investmentsNextMaturity));

    expect(onPortfolioPress).toHaveBeenCalledTimes(1);
    expect(onSuggestionsPress).toHaveBeenCalledTimes(1);
    expect(onMaturityPress).toHaveBeenCalledWith("asset-1");
  });
});
