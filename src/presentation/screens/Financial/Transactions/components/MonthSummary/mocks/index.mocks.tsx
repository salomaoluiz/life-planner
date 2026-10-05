import { render } from "@tests";

import MonthSummary from "../";

const onRetry = jest.fn();

function setup(props: Partial<React.ComponentProps<typeof MonthSummary>> = {}) {
  render(
    <MonthSummary
      balanceCents={1000}
      balanceLabel={"Balance"}
      errorMessage={"boom"}
      expenseCents={2000}
      expensesLabel={"Expenses"}
      incomeCents={3000}
      incomesLabel={"Incomes"}
      isError={false}
      isLoading={false}
      onRetry={onRetry}
      retryLabel={"Try again"}
      {...props}
    />,
  );

  return { onRetry };
}

beforeEach(() => {
  jest.clearAllMocks();
});

export { setup };
