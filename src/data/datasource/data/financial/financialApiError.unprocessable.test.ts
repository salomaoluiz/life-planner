import {
  AccountArchived,
  ApiBusinessError,
  GenericError,
} from "@domain/entities/errors";

import handleFinancialApiError from "./financialApiError";

function run(options = {}) {
  try {
    handleFinancialApiError(
      new ApiBusinessError("Unprocessable", 422),
      { datasource: "x" },
      options,
    );
  } catch (error) {
    return error;
  }
}

it("SHOULD map a 422 to the error the caller provides", () => {
  expect(run({ unprocessable: () => new AccountArchived() })).toBeInstanceOf(
    AccountArchived,
  );
});

it("SHOULD fall back to GenericError WHEN the caller maps no 422", () => {
  expect(run()).toBeInstanceOf(GenericError);
});
