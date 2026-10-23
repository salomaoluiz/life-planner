import { BusinessError, ImportRowsInvalid } from "@domain/entities/errors";

import {
  category,
  chooseOption,
  CSV,
  fireEvent,
  ids,
  ImportWizard,
  mutations,
  options,
  params,
  pickFile,
  screen,
  setup,
  spies,
  toColumns,
  useFilterOptions,
  waitFor,
} from "./mocks/index.mocks";

const MANY_ROWS = `Data;Desc;Valor\n${Array.from({ length: 2001 }, () => "02/10/2026;x;1,00").join("\n")}`;

// Two card rows: a purchase and a refund (a card credit), all matched by name (spec 048/049).
const CREDITS = [
  "Data;Histórico;Valor;Categoria;Cartão",
  "05/10/2026;Mercado;-10,00;Mercado;Visa",
  "06/10/2026;Estorno;12,00;Estorno;Visa",
  "",
].join("\r\n");

// One card, two currencies: the group has one income pair per currency, never converted (spec 049 FR 9).
const MIXED = [
  "Data;Histórico;Valor;Categoria;Cartão;Moeda",
  "05/10/2026;Estorno;12,00;Estorno;Visa;BRL",
  "06/10/2026;Estorno;20,00;Estorno;Visa;USD",
  "07/10/2026;Mercado;-5,00;Mercado;Visa;BRL",
  "",
].join("\r\n");

describe("step 1: file and owner", () => {
  it("SHOULD start without a file, with Personal and the family as owners and Continue disabled", () => {
    setup();

    expect(screen.getByTestId(ids.importPick)).toBeOnTheScreen();
    expect(screen.getByTestId(`${ids.importOwner}-user-id`)).toBeOnTheScreen();
    expect(screen.getByTestId(`${ids.importOwner}-family-1`)).toBeOnTheScreen();
    expect(screen.getByTestId(ids.importContinue)).toBeDisabled();
  });

  it("SHOULD show the file, its preview and the detected options, and enable Continue", async () => {
    setup();

    await pickFile();

    expect(screen.getByText("extrato.csv")).toBeOnTheScreen();
    expect(screen.getByTestId(ids.importPreview)).toBeOnTheScreen();
    expect(screen.getByText("Supermercado")).toBeOnTheScreen();
    expect(
      screen.getByTestId(`${ids.importSeparator}-value`),
    ).toHaveTextContent(/financial\.import\.file\.separator\.semicolon/);
    expect(screen.getByTestId(ids.importContinue)).toBeEnabled();
    expect(screen.queryByTestId(ids.importEncoding)).toBeNull();
  });

  it("SHOULD re-read the file WHEN the separator is changed", async () => {
    setup();
    await pickFile();

    await chooseOption(ids.importSeparator, ",");

    // With "," the semicolon header is a single column.
    expect(screen.queryByText("Histórico")).toBeNull();
  });

  it.each([
    [
      "more than 2,000 rows",
      MANY_ROWS,
      "financial.import.file.problems.tooManyRows",
    ],
    ["only a header", "Data;Valor\n", "financial.import.file.problems.empty"],
  ])(
    "SHOULD refuse a file with %s and keep Continue disabled",
    async (_name, text, key) => {
      setup();

      await pickFile(text);

      expect(screen.getByTestId(ids.importFileProblem)).toHaveTextContent(key);
      expect(screen.getByTestId(ids.importContinue)).toBeDisabled();
    },
  );

  it("SHOULD show a read error WHEN the picker fails", async () => {
    setup();
    spies.pick.mockRejectedValueOnce(new Error("boom"));

    fireEvent.press(screen.getByTestId(ids.importPick));

    await waitFor(() =>
      expect(screen.getByTestId(ids.importFileProblem)).toHaveTextContent(
        /financial\.import\.file\.problems\.readError/,
      ),
    );
  });

  it("SHOULD offer the encoding select WHEN the bytes are not UTF-8", async () => {
    setup();
    const bytes = new Uint8Array([
      ...new TextEncoder().encode("Data;Hist"),
      0xf3,
      ...new TextEncoder().encode("rico\n02/10/2026;x\n"),
    ]);

    spies.pick.mockResolvedValueOnce({
      bytes,
      name: "a.csv",
      size: bytes.length,
    });
    fireEvent.press(screen.getByTestId(ids.importPick));

    await waitFor(() =>
      expect(screen.getByTestId(ids.importEncoding)).toBeOnTheScreen(),
    );
  });

  it("SHOULD default the owner to the family chosen on the screen", () => {
    setup({ screenOwner: "family-1" });

    expect(
      screen.getByTestId(`${ids.importOwner}-family-1`).props.accessibilityState
        .selected,
    ).toBe(true);
  });
});

describe("closing", () => {
  it("SHOULD close at once WHEN nothing was loaded", () => {
    setup();

    fireEvent.press(screen.getByTestId(ids.importCancel));

    expect(params.onClose).toHaveBeenCalledTimes(1);
  });

  it("SHOULD ask to discard WHEN a file was loaded, and keep the wizard on Keep editing", async () => {
    setup();
    await pickFile();

    fireEvent.press(screen.getByTestId(ids.importCancel));

    expect(params.onClose).not.toHaveBeenCalled();
    expect(screen.getByTestId(ids.importDiscardDialog)).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId(`${ids.importDiscardDialog}-cancel`));
    expect(screen.queryByTestId(ids.importDiscardDialog)).toBeNull();

    fireEvent.press(screen.getByTestId(ids.importCancel));
    fireEvent.press(screen.getByTestId(`${ids.importDiscardDialog}-confirm`));
    expect(params.onClose).toHaveBeenCalledTimes(1);
  });
});

describe("step 2: columns", () => {
  it("SHOULD suggest the columns by header and flag the missing account or card", async () => {
    setup();

    await toColumns();

    expect(screen.getByTestId(`${ids.importColumn}.0-value`)).toHaveTextContent(
      /financial\.import\.columns\.targets\.date/,
    );
    expect(screen.getByTestId(`${ids.importColumn}.2-value`)).toHaveTextContent(
      /financial\.import\.columns\.targets\.signedAmount/,
    );
    expect(
      screen.getByTestId(`${ids.importRequired}.accountOrCard`),
    ).toHaveTextContent(/financial\.import\.columns\.missingError/);
    expect(screen.getByTestId(ids.importContinue)).toBeDisabled();
  });

  it("SHOULD enable Continue once an account covers the rows without a card", async () => {
    setup();
    await toColumns();

    await chooseOption(`${ids.importFixed}.accountOrCard`, "account:acc-1");

    expect(screen.getByTestId(ids.importContinue)).toBeEnabled();
  });

  it("SHOULD move a target to the column chosen for it", async () => {
    setup();
    await toColumns();

    await chooseOption(`${ids.importColumn}.1`, "date");

    expect(screen.getByTestId(`${ids.importColumn}.0-value`)).toHaveTextContent(
      /financial\.import\.columns\.targets\.ignore/,
    );
    expect(
      screen.getByTestId(`${ids.importRequired}.description`),
    ).toHaveTextContent(/financial\.import\.columns\.missingError/);
  });

  it("SHOULD keep the mapping WHEN the same headers are chosen again", async () => {
    setup();
    await toColumns();
    await chooseOption(`${ids.importFixed}.accountOrCard`, "account:acc-1");
    fireEvent.press(screen.getByTestId(ids.importBack));

    await pickFile();
    fireEvent.press(screen.getByTestId(ids.importContinue));

    expect(screen.getByTestId(ids.importContinue)).toBeEnabled();
  });
});

async function toValues() {
  await toColumns();
  await chooseOption(`${ids.importFixed}.accountOrCard`, "account:acc-1");
  fireEvent.press(screen.getByTestId(ids.importContinue));
}

describe("step 3: values", () => {
  it("SHOULD match what it can by name and block Continue for the value without a match", async () => {
    setup();

    await toValues();

    expect(
      screen.getByTestId(`${ids.importValue}.category.0-value`),
    ).toHaveTextContent("Mercado");
    expect(screen.getByTestId(ids.importFooterNote)).toHaveTextContent(
      /financial\.import\.values\.unmatched_one/,
    );
    expect(screen.getByTestId(ids.importContinue)).toBeDisabled();
  });

  it("SHOULD enable Continue once the value is matched to a category", async () => {
    setup();
    await toValues();

    await chooseOption(`${ids.importValue}.category.2`, "cat-market");

    expect(screen.queryByTestId(ids.importFooterNote)).toBeNull();
    expect(screen.getByTestId(ids.importContinue)).toBeEnabled();
  });

  it("SHOULD create the missing category with the type taken from its rows and select it", async () => {
    const view = setup();
    await toValues();

    await chooseOption(`${ids.importValue}.category.2`, "__create__");

    expect(screen.getByTestId(ids.importCreateName)).toHaveProp(
      "value",
      "Assinaturas",
    );
    expect(
      screen.getByTestId(`${ids.importCreateType}-EXPENSE`).props
        .accessibilityState.selected,
    ).toBe(true);

    fireEvent.press(screen.getByTestId(ids.importCreateSubmit));
    expect(mutations.create.value.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        form: expect.objectContaining({ name: "Assinaturas", type: "EXPENSE" }),
        tab: "category",
      }),
    );

    // The mutation runs the use case in the owner of the file.
    const create = spies.useMutation.mock.calls.find(
      ([props]) => props.cacheKey[0] === "financial.import_create_record",
    );

    await create?.[0].fetch({
      form: {
        closingDay: "1",
        dueDay: "10",
        limitCents: 0,
        name: "Assinaturas",
        parentId: "",
        type: "EXPENSE",
      },
      ownerId: "user-id",
      parentDepth: 0,
      tab: "category",
    });
    expect(spies.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Assinaturas",
        owner: "USER",
        ownerId: "user-id",
      }),
    );

    // The refreshed lists carry the new record: it is selected for the value.
    jest.mocked(useFilterOptions).mockReturnValue({
      ...options,
      categoryDtos: [
        ...options.categoryDtos,
        category("cat-subs", "Assinaturas"),
      ],
    } as never);
    view.rerender(<ImportWizard {...params} />);

    expect(
      screen.getByTestId(`${ids.importValue}.category.2-value`),
    ).toHaveTextContent("Assinaturas");
    expect(screen.getByTestId(ids.importContinue)).toBeEnabled();
  });

  it("SHOULD keep the last Belongs to chosen WHEN the form opens for another value (spec 048)", async () => {
    setup();
    await toValues();

    await chooseOption(`${ids.importValue}.category.2`, "__create__");
    fireEvent.press(screen.getByTestId(`${ids.importCreateScope}-ALL`));
    expect(
      screen.getByTestId(`${ids.importCreateScope}-ALL`).props
        .accessibilityState.selected,
    ).toBe(true);

    fireEvent.press(screen.getByTestId(ids.importCreateCancel));
    await chooseOption(`${ids.importValue}.category.2`, "__create__");

    expect(
      screen.getByTestId(`${ids.importCreateScope}-ALL`).props
        .accessibilityState.selected,
    ).toBe(true);
  });

  it("SHOULD create each level of a category path, parent first", async () => {
    setup();
    await toColumns();
    await chooseOption(`${ids.importFixed}.accountOrCard`, "account:acc-1");
    fireEvent.press(screen.getByTestId(ids.importContinue));

    const create = spies.useMutation.mock.calls.find(
      ([props]) => props.cacheKey[0] === "financial.import_create_record",
    )?.[0];

    await create?.fetch({
      form: {
        closingDay: "1",
        dueDay: "10",
        limitCents: 0,
        name: "Finanças > Investimentos",
        parentId: "",
        type: "EXPENSE",
      },
      ownerId: "user-id",
      parentDepth: 0,
      tab: "category",
    });

    expect(spies.create).toHaveBeenCalledTimes(1);
    expect(spies.create).toHaveBeenCalledWith(
      expect.objectContaining({ depthLevel: 0, name: "Finanças" }),
    );
  });

  it("SHOULD create an account and a card with their own fields", async () => {
    setup();
    await toColumns();
    // The card column makes the Card tab: "Visa" matches the card, nothing to create.
    await chooseOption(`${ids.importFixed}.accountOrCard`, "account:acc-1");
    fireEvent.press(screen.getByTestId(ids.importContinue));

    const create = spies.useMutation.mock.calls.find(
      ([props]) => props.cacheKey[0] === "financial.import_create_record",
    )?.[0];

    await create?.fetch({
      form: {
        closingDay: "5",
        dueDay: "12",
        limitCents: 100000,
        name: "Master",
        parentId: "",
        type: "EXPENSE",
      },
      ownerId: "user-id",
      parentDepth: 0,
      tab: "card",
    });
    await create?.fetch({
      form: {
        closingDay: "1",
        dueDay: "10",
        limitCents: 0,
        name: "Poupança",
        parentId: "",
        type: "EXPENSE",
      },
      ownerId: "user-id",
      parentDepth: 0,
      tab: "account",
    });

    expect(spies.createCard).toHaveBeenCalledWith(
      expect.objectContaining({
        brand: "OTHER",
        closingDay: 5,
        dueDay: 12,
        limit: 100000,
        title: "Master",
      }),
    );
    expect(spies.createAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        balance: 0,
        name: "Poupança",
        status: "ACTIVE",
      }),
    );
  });
});

interface DryRun {
  includeDuplicates?: number[];
  rows: { line: number }[];
}

async function toReview(withChoice = true) {
  await toValues();
  if (withChoice) {
    await chooseOption(`${ids.importValue}.category.2`, "cat-market");
  }
  fireEvent.press(screen.getByTestId(ids.importContinue));
}

const NO_ISSUES = { duplicates: [], errors: [] };

describe("step 4: review and import", () => {
  it("SHOULD run the dry run with the rows built from the mappings", async () => {
    setup();

    await toReview();

    expect(mutations.validate.value.mutate).toHaveBeenCalledTimes(1);
    expect(mutations.validate.value.mutate).toHaveBeenCalledWith({
      requestId: 1,
      rows: [
        expect.objectContaining({
          accountId: "acc-1",
          categoryId: "cat-market",
          date: "2026-10-02",
          description: "Supermercado",
          line: 2,
          type: "EXPENSE",
          value: 31240,
        }),
        expect.objectContaining({
          categoryId: "cat-salary",
          line: 3,
          type: "INCOME",
          value: 520000,
        }),
        expect.objectContaining({
          accountId: undefined,
          creditCardId: "card-1",
          line: 4,
          type: "EXPENSE",
          value: 3990,
        }),
      ],
    });
  });

  it("SHOULD list the rows with the summary and import the checked ones", async () => {
    setup();
    mutations.validate.value.data = NO_ISSUES;
    await toReview();

    expect(screen.getByTestId(`${ids.importRow}.2`)).toBeOnTheScreen();
    expect(screen.getByTestId(`${ids.importSummary}.ready`)).toHaveTextContent(
      /3/,
    );
    expect(
      screen.getByText(/financial\.import\.review\.submit_other/),
    ).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId(ids.importSubmit));

    expect(mutations.import.value.mutate).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ line: 2 })]),
    );
    expect(
      jest.mocked(mutations.import.value.mutate).mock.calls[0][0],
    ).toHaveLength(3);
  });

  it("SHOULD come with the duplicates unchecked and import them only when checked", async () => {
    const view = setup();
    mutations.validate.value.data = { duplicates: [3], errors: [] };
    await toReview();

    expect(
      screen.getByTestId(`${ids.importRow}.3.check`).props.accessibilityState
        .checked,
    ).toBe(false);
    expect(
      screen.getByTestId(`${ids.importRow}.3.duplicate`),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(`${ids.importSummary}.duplicates`),
    ).toHaveTextContent(/1/);

    fireEvent.press(screen.getByTestId(`${ids.importRow}.3.check`));
    // Spec 049: the new selection is checked when the user asks for it.
    fireEvent.press(screen.getByTestId(ids.importRefresh));
    mutations.validate.value.data = { duplicates: [3], errors: [] };
    view.rerender(<ImportWizard {...params} />);
    fireEvent.press(screen.getByTestId(ids.importSubmit));

    expect(
      jest.mocked(mutations.import.value.mutate).mock.calls[0][0],
    ).toHaveLength(3);
  });

  it("SHOULD not send a dry run WHEN a row is checked (spec 049)", async () => {
    setup();
    mutations.validate.value.data = NO_ISSUES;
    await toReview();
    jest.mocked(mutations.validate.value.mutate).mockClear();

    fireEvent.press(screen.getByTestId(`${ids.importRow}.3.check`));

    expect(mutations.validate.value.mutate).not.toHaveBeenCalled();
    expect(screen.getByTestId(ids.importStale)).toBeOnTheScreen();
    expect(screen.getByTestId(ids.importSubmit)).toBeDisabled();
  });

  it("SHOULD be fresh again WHEN the same row is checked and unchecked (spec 049)", async () => {
    setup();
    mutations.validate.value.data = NO_ISSUES;
    await toReview();
    jest.mocked(mutations.validate.value.mutate).mockClear();

    fireEvent.press(screen.getByTestId(`${ids.importRow}.3.check`));
    fireEvent.press(screen.getByTestId(`${ids.importRow}.3.check`));

    expect(screen.queryByTestId(ids.importStale)).toBeNull();
    expect(screen.getByTestId(ids.importSubmit)).toBeEnabled();
    expect(mutations.validate.value.mutate).not.toHaveBeenCalled();
  });

  it("SHOULD send the checked rows WHEN Refresh is pressed (spec 049)", async () => {
    setup();
    mutations.validate.value.data = NO_ISSUES;
    await toReview();
    jest.mocked(mutations.validate.value.mutate).mockClear();

    fireEvent.press(screen.getByTestId(`${ids.importRow}.3.check`));
    fireEvent.press(screen.getByTestId(ids.importRefresh));

    const request = jest.mocked(mutations.validate.value.mutate).mock
      .calls[0][0] as unknown as DryRun & { requestId: number };

    expect(request.includeDuplicates).toEqual([]);
    expect(request.rows.map((row) => row.line)).toEqual([2, 4]);
    expect(request.requestId).toEqual(2);
  });

  it("SHOULD apply the refresh response and clear the stale state (spec 049)", async () => {
    const view = setup();
    mutations.validate.value.data = NO_ISSUES;
    await toReview();

    fireEvent.press(screen.getByTestId(`${ids.importRow}.3.check`));
    expect(screen.getByTestId(ids.importStale)).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId(ids.importRefresh));
    mutations.validate.value.data = {
      duplicates: [],
      errors: [],
      invoices: [],
    };
    view.rerender(<ImportWizard {...params} />);

    expect(screen.queryByTestId(ids.importStale)).toBeNull();
    expect(screen.getByTestId(ids.importSubmit)).toBeEnabled();
  });

  it("SHOULD stay stale WHEN the selection changes during a refresh (spec 049)", async () => {
    const view = setup();
    mutations.validate.value.data = NO_ISSUES;
    await toReview();

    fireEvent.press(screen.getByTestId(`${ids.importRow}.3.check`));
    fireEvent.press(screen.getByTestId(ids.importRefresh));
    fireEvent.press(screen.getByTestId(`${ids.importRow}.2.check`));
    mutations.validate.value.data = {
      duplicates: [],
      errors: [],
      invoices: [],
    };
    view.rerender(<ImportWizard {...params} />);

    expect(screen.getByTestId(ids.importStale)).toBeOnTheScreen();
    expect(screen.getByTestId(ids.importSubmit)).toBeDisabled();
  });

  it("SHOULD keep the previous values and the failure WHEN the refresh fails (spec 049)", async () => {
    const view = setup();
    mutations.validate.value.data = NO_ISSUES;
    await toReview();

    fireEvent.press(screen.getByTestId(`${ids.importRow}.3.check`));
    fireEvent.press(screen.getByTestId(ids.importRefresh));
    mutations.validate.value.status = "error";
    mutations.validate.value.error = new BusinessError();
    view.rerender(<ImportWizard {...params} />);

    expect(
      screen.getByText(/financial.import.review.refresh.failed/),
    ).toBeOnTheScreen();
    expect(screen.getByTestId(ids.importStale)).toBeOnTheScreen();
    expect(screen.getByTestId(ids.importSubmit)).toBeDisabled();
  });

  it("SHOULD block the import WHEN the first check fails (spec 049)", async () => {
    setup();
    mutations.validate.value.status = "error";
    mutations.validate.value.error = new BusinessError();
    await toReview();

    expect(screen.getByTestId(ids.importSubmit)).toBeDisabled();
  });

  it("SHOULD keep the credit counts of the last check WHEN stale (spec 049)", async () => {
    setup();
    mutations.validate.value.data = NO_ISSUES;
    await pickFile(CREDITS);
    fireEvent.press(screen.getByTestId(ids.importContinue));
    fireEvent.press(screen.getByTestId(ids.importContinue));
    fireEvent.press(screen.getByTestId(ids.importContinue));

    expect(
      screen.getByTestId(`${ids.importSummary}.credits`),
    ).toHaveTextContent(/1/);

    fireEvent.press(screen.getByTestId(`${ids.importRow}.3.check`));

    expect(
      screen.getByTestId(`${ids.importSummary}.credits`),
    ).toHaveTextContent(/1/);
  });

  it("SHOULD split the review into the Account and Card blocks (spec 049)", async () => {
    setup();
    mutations.validate.value.data = NO_ISSUES;
    await toReview();

    expect(screen.getByTestId(`${ids.importGroup}.account`)).toBeOnTheScreen();
    expect(screen.getByTestId(`${ids.importGroup}.card`)).toBeOnTheScreen();
    expect(
      screen.getByTestId(`${ids.importGroup}.account.0`),
    ).toBeOnTheScreen();
    expect(screen.getByTestId(`${ids.importGroup}.card.0`)).toBeOnTheScreen();
    expect(
      screen.getByTestId(`${ids.importGroup}.account.income`),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(`${ids.importGroup}.card.expenses`),
    ).toBeOnTheScreen();
    expect(screen.getByTestId(`${ids.importRow}.2`)).toBeOnTheScreen();
    expect(screen.getByTestId(`${ids.importRow}.4`)).toBeOnTheScreen();
  });

  it("SHOULD show No rows and zero subtotals WHEN a block has no rows (spec 049)", async () => {
    setup();
    mutations.validate.value.data = NO_ISSUES;
    await pickFile(CREDITS);
    fireEvent.press(screen.getByTestId(ids.importContinue));
    fireEvent.press(screen.getByTestId(ids.importContinue));
    fireEvent.press(screen.getByTestId(ids.importContinue));

    expect(screen.getByTestId(`${ids.importGroup}.account`)).toBeOnTheScreen();
    expect(
      screen.getByText(/financial.import.review.groups.noRows/),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(`${ids.importGroup}.account.income`),
    ).toBeOnTheScreen();
  });

  it("SHOULD keep the groups with their subtotals WHEN the filter hides them (spec 049)", async () => {
    setup();
    mutations.validate.value.data = {
      duplicates: [],
      errors: [{ code: "CURRENCY_MISMATCH", line: 4, message: "x" }],
    };
    await toReview();

    fireEvent.press(screen.getByTestId(`${ids.importFilter}-ERRORS`));

    expect(
      screen.getByTestId(`${ids.importGroup}.account.0`),
    ).toBeOnTheScreen();
    expect(screen.getByTestId(`${ids.importGroup}.card.0`)).toBeOnTheScreen();
    expect(screen.getByTestId(`${ids.importRow}.4`)).toBeOnTheScreen();
    expect(screen.queryByTestId(`${ids.importRow}.2`)).toBeNull();
  });

  it("SHOULD put a row without a record in its own group (spec 049)", async () => {
    setup();
    mutations.validate.value.data = NO_ISSUES;
    await pickFile(CSV.replace("02/10/2026", "31/09/2026"));
    fireEvent.press(screen.getByTestId(ids.importContinue));
    await chooseOption(`${ids.importFixed}.accountOrCard`, "account:acc-1");
    fireEvent.press(screen.getByTestId(ids.importContinue));
    await chooseOption(`${ids.importValue}.category.2`, "cat-market");
    fireEvent.press(screen.getByTestId(ids.importContinue));

    expect(
      screen.getByText(/financial.import.review.groups.noRecord/),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(`${ids.importGroup}.account.0`),
    ).toBeOnTheScreen();
  });

  it("SHOULD show the invoices caption WHEN the review is stale (spec 049)", async () => {
    setup();
    mutations.validate.value.data = {
      duplicates: [],
      errors: [],
      invoices: [
        {
          amountDue: 10000,
          creditCardId: "card-1",
          invoiceMonth: "2026-10",
          paid: false,
        },
      ],
    };
    await toReview();

    expect(
      screen.queryByTestId(`${ids.importSummary}.invoices-stale`),
    ).toBeNull();

    fireEvent.press(screen.getByTestId(`${ids.importRow}.3.check`));

    expect(
      screen.getByTestId(`${ids.importSummary}.invoices-stale`),
    ).toBeOnTheScreen();
  });

  it("SHOULD not hide the list while refreshing (spec 049)", async () => {
    const view = setup();
    mutations.validate.value.data = NO_ISSUES;
    await toReview();

    fireEvent.press(screen.getByTestId(ids.importRefresh));
    mutations.validate.value.isFetching = true;
    view.rerender(<ImportWizard {...params} />);

    expect(screen.getByTestId(`${ids.importRow}.2`)).toBeOnTheScreen();
    expect(screen.getByTestId(ids.importRefresh)).toHaveTextContent(
      /financial.import.review.refresh.refreshing/,
    );
  });

  it("SHOULD render one total pair per currency (spec 049)", async () => {
    setup();
    mutations.validate.value.data = NO_ISSUES;
    await pickFile(MIXED);
    fireEvent.press(screen.getByTestId(ids.importContinue));
    fireEvent.press(screen.getByTestId(ids.importContinue));
    fireEvent.press(screen.getByTestId(ids.importContinue));

    const income = screen.getByTestId(`${ids.importGroup}.card.0.income`);

    // The en-US mock renders BRL as R$ and USD as $ (no conversion, one line each).
    expect(income).toHaveTextContent(/R\$12[.,]00/);
    expect(income).toHaveTextContent(/\$20[.,]00/);
  });

  it("SHOULD show the group totals on compact (spec 049)", async () => {
    setup({}, "compact");
    mutations.validate.value.data = NO_ISSUES;
    await toReview();

    expect(
      screen.getByTestId(`${ids.importGroup}.card.0.income`),
    ).toBeOnTheScreen();
    expect(
      screen.getByTestId(`${ids.importGroup}.card.0.expenses`),
    ).toBeOnTheScreen();
  });

  it("SHOULD block the import WHEN a row has an error, and say how many to fix", async () => {
    setup();
    mutations.validate.value.data = {
      duplicates: [],
      errors: [{ code: "CURRENCY_MISMATCH", line: 4, message: "USD ≠ BRL" }],
    };
    await toReview();

    expect(screen.getByTestId(`${ids.importRow}.4.error`)).toBeOnTheScreen();
    expect(
      screen.getByTestId(`${ids.importRow}.4.check`).props.accessibilityState
        .disabled,
    ).toBe(true);
    expect(screen.getByTestId(ids.importFooterNote)).toHaveTextContent(
      /financial\.import\.review\.footerErrors_one/,
    );
    expect(screen.getByTestId(ids.importSubmit)).toBeDisabled();
  });

  it("SHOULD filter the rows to the errors and the duplicates", async () => {
    setup();
    mutations.validate.value.data = {
      duplicates: [3],
      errors: [{ code: "CURRENCY_MISMATCH", line: 4, message: "x" }],
    };
    await toReview();

    fireEvent.press(screen.getByTestId(`${ids.importFilter}-ERRORS`));
    expect(screen.queryByTestId(`${ids.importRow}.2`)).toBeNull();
    expect(screen.getByTestId(`${ids.importRow}.4`)).toBeOnTheScreen();

    fireEvent.press(screen.getByTestId(`${ids.importFilter}-DUPLICATES`));
    expect(screen.getByTestId(`${ids.importRow}.3`)).toBeOnTheScreen();
    expect(screen.queryByTestId(`${ids.importRow}.4`)).toBeNull();
  });

  it("SHOULD report a row the app cannot read (a bad date) as an error before asking the API", async () => {
    setup();
    mutations.validate.value.data = NO_ISSUES;
    await pickFile(CSV.replace("02/10/2026", "31/09/2026"));
    fireEvent.press(screen.getByTestId(ids.importContinue));
    await chooseOption(`${ids.importFixed}.accountOrCard`, "account:acc-1");
    fireEvent.press(screen.getByTestId(ids.importContinue));
    await chooseOption(`${ids.importValue}.category.2`, "cat-market");
    fireEvent.press(screen.getByTestId(ids.importContinue));

    expect(screen.getByTestId(`${ids.importRow}.2.error`)).toHaveTextContent(
      /financial\.import\.errors\.INVALID_DATE/,
    );
    expect(screen.getByTestId(ids.importSubmit)).toBeDisabled();
    expect(
      (
        jest.mocked(mutations.validate.value.mutate).mock
          .calls[0][0] as unknown as DryRun
      ).rows,
    ).toHaveLength(2);
  });

  it("SHOULD keep the wizard on step 4 with the rows the API refused", async () => {
    setup();
    mutations.validate.value.data = NO_ISSUES;
    mutations.import.value.error = new ImportRowsInvalid([
      { code: "ACCOUNT_ARCHIVED", line: 2, message: "Account is archived" },
    ]);
    await toReview();

    expect(screen.getByTestId(`${ids.importRow}.2.error`)).toHaveTextContent(
      /financial\.import\.errors\.ACCOUNT_ARCHIVED/,
    );
    expect(screen.getByTestId(ids.importSubmit)).toBeDisabled();
  });

  it("SHOULD close with the count WHEN the import succeeds", async () => {
    const view = setup();
    mutations.validate.value.data = NO_ISSUES;
    await toReview();

    mutations.import.value.status = "success";
    mutations.import.value.data = 3;
    view.rerender(<ImportWizard {...params} />);

    await waitFor(() => expect(params.onImported).toHaveBeenCalledWith(3));
    expect(params.onClose).toHaveBeenCalledTimes(1);
  });

  it("SHOULD not allow the import while the rows are being checked again", async () => {
    setup();
    mutations.validate.value.data = NO_ISSUES;
    mutations.validate.value.isFetching = true;
    await toReview();

    expect(screen.getByTestId(ids.importSubmit)).toBeDisabled();
  });

  it("SHOULD go back to the earlier steps", async () => {
    setup();
    mutations.validate.value.data = NO_ISSUES;
    await toReview();

    fireEvent.press(screen.getByTestId(ids.importBack));
    expect(
      screen.getByTestId(`${ids.importValue}.category.0`),
    ).toBeOnTheScreen();
  });
});

describe("owner change", () => {
  it("SHOULD ask before clearing the matched values", async () => {
    setup();
    await toValues();
    await chooseOption(`${ids.importValue}.category.2`, "cat-market");
    fireEvent.press(screen.getByTestId(ids.importBack));
    fireEvent.press(screen.getByTestId(ids.importBack));

    fireEvent.press(screen.getByTestId(`${ids.importOwner}-family-1`));

    expect(screen.getByTestId(ids.importOwnerConfirm)).toBeOnTheScreen();
    fireEvent.press(screen.getByTestId(`${ids.importOwnerConfirm}-confirm`));
    expect(
      screen.getByTestId(`${ids.importOwner}-family-1`).props.accessibilityState
        .selected,
    ).toBe(true);
  });

  it("SHOULD change the owner at once before any value was matched", async () => {
    setup();
    await pickFile();

    fireEvent.press(screen.getByTestId(`${ids.importOwner}-family-1`));

    expect(screen.queryByTestId(ids.importOwnerConfirm)).toBeNull();
  });
});

describe("compact layout", () => {
  it("SHOULD name the step in the title and show the progress bar", () => {
    setup({}, "compact");

    expect(screen.getByTestId(`${ids.importSheet}-title`)).toHaveTextContent(
      /financial\.import\.steps\.file/,
    );
    expect(screen.getByTestId(ids.importStepper).props.accessibilityRole).toBe(
      "progressbar",
    );
  });
});

describe("owner per row", () => {
  const OWNER_CSV = [
    "Data;Descrição;Valor;Categoria;Conta;Pertence a",
    "02/10/2026;Mercado A;-10,00;Mercado;Corrente;Família",
    "03/10/2026;Mercado B;-20,00;Mercado;Corrente;Pessoal",
    "",
  ].join("\r\n");

  function withFamilyRecords() {
    jest.mocked(useFilterOptions).mockReturnValue({
      ...options,
      categoryDtos: [
        ...options.categoryDtos,
        {
          ...category("cat-fam", "Mercado"),
          ownerId: "family-1",
          scopeOwnerIds: ["family-1"],
        },
      ],
      sources: [
        ...options.sources,
        {
          archived: false,
          currency: "BRL" as const,
          id: "acc-fam",
          kind: "ACCOUNT" as const,
          name: "Corrente",
          ownerId: "family-1",
        },
      ],
    } as never);
  }

  it("SHOULD map the Belongs to column, match the owners and import each row in its owner", async () => {
    setup();
    withFamilyRecords();
    mutations.validate.value.data = { duplicates: [], errors: [] };

    await pickFile(OWNER_CSV);
    fireEvent.press(screen.getByTestId(ids.importContinue));
    expect(screen.getByTestId(`${ids.importColumn}.5-value`)).toHaveTextContent(
      /financial\.import\.columns\.targets\.owner/,
    );
    fireEvent.press(screen.getByTestId(ids.importContinue));

    // Both owners are matched by name: nothing is left to choose.
    expect(screen.getByTestId(`${ids.importValueTab}-owner`)).toBeOnTheScreen();
    expect(screen.queryByTestId(ids.importFooterNote)).toBeNull();
    fireEvent.press(screen.getByTestId(ids.importContinue));

    expect(mutations.validate.value.mutate).toHaveBeenCalledWith({
      requestId: 1,
      rows: [
        expect.objectContaining({
          accountId: "acc-fam",
          categoryId: "cat-fam",
          owner: "FAMILY",
          ownerId: "family-1",
        }),
        expect.objectContaining({
          accountId: "acc-1",
          categoryId: "cat-market",
          owner: "USER",
          ownerId: "user-id",
        }),
      ],
    });
  });
});
