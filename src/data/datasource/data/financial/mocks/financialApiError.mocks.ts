import { BusinessError } from "@domain/entities/errors";

import handleFinancialApiError from "../financialApiError";

// region mocks
const context = { datasource: "TestDatasource - test", id: "id-1" };
class TestConflict extends BusinessError {}
// endregion mocks

function setupThrowable(
  error: unknown,
  options?: Parameters<typeof handleFinancialApiError>[2],
) {
  try {
    handleFinancialApiError(error, context, options);
  } catch (thrown) {
    return thrown;
  }
}

const spies = {};
const mocks = { context, TestConflict };

export { mocks, setupThrowable, spies };
