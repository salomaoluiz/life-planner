import {
  AccountArchived,
  ApiBusinessError,
  FamilyArchived,
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

it("SHOULD map the archived family message of any write to FamilyArchived (spec 042)", () => {
  try {
    handleFinancialApiError(
      new ApiBusinessError("Family is archived", 422),
      { datasource: "x" },
      { unprocessable: () => undefined },
    );
  } catch (error) {
    expect(error).toBeInstanceOf(FamilyArchived);
    return;
  }

  throw new Error("expected an error");
});
