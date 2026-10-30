import { act } from "@tests";
import { modalNavigation } from "@tests/modalNavigation";

import {
  CategoryHasPendingItems,
  CategoryHasTransactions,
  CategoryParentArchived,
} from "@domain/entities/errors";
import { isPaletteColor } from "@presentation/constants/categoryColors";

import {
  cat,
  givenLoaded,
  mutations,
  setup,
  tx,
} from "./mocks/useNewCategoryViewModel.mocks";

it("SHOULD start a new category as expense, with a palette color, folder, Personal, without parent", () => {
  givenLoaded();
  const { result } = setup();

  expect(result.current.isEditing).toBe(false);
  expect(result.current.type).toBe("EXPENSE");
  expect(isPaletteColor(result.current.iconColor)).toBe(true);
  expect(result.current.iconColor).not.toBe("#64748B");
  expect(result.current.icon).toBe("folder");
  expect(result.current.ownerId).toBe("user-id");
  expect(result.current.parentId).toBe("");
  expect(result.current.titleKey).toBe("financial.categories.new");
  expect(result.current.saveLabelKey).toBe("financial.categories.form.save");
});

it("SHOULD preset type and owner from the route params and lock the owner", () => {
  givenLoaded({ params: { ownerId: "family-1", type: "INCOME" } });
  const { result } = setup();

  expect(result.current.type).toBe("INCOME");
  expect(result.current.ownerId).toBe("family-1");
  expect(result.current.isOwnerLocked).toBe(true);
});

it("SHOULD prefill in edit mode and report notFound for an unknown id", () => {
  givenLoaded({
    categories: [cat("c1", { name: "Old" })],
    params: { id: "c1" },
  });
  expect(setup().result.current.name).toBe("Old");

  givenLoaded({ categories: [cat("c1")], params: { id: "gone" } });
  expect(setup().result.current.isNotFound).toBe(true);
});

it("SHOULD lock the type in edit WHEN it has a parent, children or transactions", () => {
  givenLoaded({
    categories: [cat("p"), cat("c1", { parentId: "p" })],
    params: { id: "c1" },
  });
  expect(setup().result.current.isTypeLocked).toBe(true);
  expect(setup().result.current.typeHelperKey).toBe(
    "financial.categories.form.typeLocked",
  );

  givenLoaded({
    categories: [cat("p"), cat("k", { parentId: "p" })],
    params: { id: "p" },
  });
  expect(setup().result.current.isTypeLocked).toBe(true);

  givenLoaded({
    categories: [cat("solo")],
    params: { id: "solo" },
    transactions: [tx("solo")],
  });
  expect(setup().result.current.isTypeLocked).toBe(true);

  givenLoaded({ categories: [cat("solo")], params: { id: "solo" } });
  expect(setup().result.current.isTypeLocked).toBe(false);
});

it("SHOULD lock the owner in edit WHEN the category has a parent AND offer only All otherwise", () => {
  givenLoaded({ categories: [cat("solo")], params: { id: "solo" } });
  expect(setup().result.current.isOwnerLocked).toBe(false);
  expect(setup().result.current.ownerHelperKey).toBe(
    "financial.common.ownerLocked",
  );
  expect(
    setup().result.current.ownerChoices.map((choice) => choice.value),
  ).toEqual(["user-id", "ALL"]);

  givenLoaded({
    categories: [cat("p"), cat("c", { parentId: "p" })],
    params: { id: "c" },
  });
  expect(setup().result.current.isOwnerLocked).toBe(true);
  expect(setup().result.current.ownerHelperKey).toBe(
    "financial.categories.form.ownerLocked",
  );

  givenLoaded();
  expect(setup().result.current.isOwnerLocked).toBe(false);
});

describe("scope ALL", () => {
  function all(overrides = {}) {
    return cat("all", {
      scope: "ALL",
      scopeOwnerIds: ["user-id", "family-1"],
      ...overrides,
    });
  }

  it("SHOULD create with owner ALL and no ownerId, listing only All parents", () => {
    givenLoaded({ categories: [all(), cat("plain")] });
    const { result } = setup();

    act(() => {
      result.current.onOwnerChange("ALL");
    });
    act(() => {
      result.current.onNameChange("Mercado");
    });

    expect(result.current.ownerHelperKey).toBe(
      "financial.categories.form.ownerAllHint",
    );
    expect(result.current.parentHelperKey).toBe(
      "financial.categories.form.parentAllHint",
    );
    expect(result.current.parentOptions.map((option) => option.value)).toEqual([
      "all",
    ]);

    act(() => {
      result.current.onSave();
    });

    expect(mutations.create.value.mutate).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Mercado",
        owner: "ALL",
        ownerId: undefined,
      }),
    );
  });

  it("SHOULD switch a single-scope category to All with scope ALL", () => {
    givenLoaded({ categories: [cat("solo")], params: { id: "solo" } });
    const { result } = setup();

    act(() => {
      result.current.onOwnerChange("ALL");
    });
    act(() => {
      result.current.onSave();
    });

    expect(mutations.update.value.mutate).toHaveBeenCalledWith({
      id: "solo",
      scope: "ALL",
    });
  });

  it("SHOULD lock an All category in edit AND use the All delete copy", () => {
    givenLoaded({ categories: [all()], params: { id: "all" } });
    const { result } = setup();

    expect(result.current.ownerId).toBe("ALL");
    expect(result.current.isOwnerLocked).toBe(true);
    expect(result.current.ownerHelperKey).toBe(
      "financial.categories.form.ownerLockedAll",
    );
    expect(result.current.deleteMessageKeys).toEqual([
      "financial.categories.deleteConfirm.allScopes",
    ]);
    expect(result.current.deleteConfirmLabelKey).toBe(
      "financial.categories.deleteAllConfirm",
    );

    act(() => {
      result.current.onDeletePress();
    });
    act(() => {
      result.current.onDeleteConfirm();
    });

    expect(mutations.delete.value.mutate).toHaveBeenCalledWith({
      id: "all",
      ownerId: "user-id",
    });
  });
});

it("SHOULD exclude itself and its descendants from the parent options in edit", () => {
  givenLoaded({
    categories: [
      cat("a"),
      cat("b", { parentId: "a" }),
      cat("c", { parentId: "b" }),
      cat("other"),
    ],
    params: { id: "a" },
  });

  expect(
    setup().result.current.parentOptions.map((option) => option.value),
  ).toEqual(["other"]);
});

it("SHOULD only offer parents of the same owner and type", () => {
  givenLoaded({
    categories: [
      cat("mine"),
      cat("income", { type: "INCOME" }),
      cat("fam", { ownerId: "family-1" }),
    ],
  });

  expect(
    setup().result.current.parentOptions.map((option) => option.value),
  ).toEqual(["mine"]);
});

it("SHOULD clear the parent WHEN the type or the owner changes", () => {
  givenLoaded({ categories: [cat("p")] });
  const { result } = setup();

  act(() => {
    result.current.onParentChange("p");
  });
  expect(result.current.parentId).toBe("p");
  act(() => {
    result.current.onTypeChange("INCOME");
  });
  expect(result.current.parentId).toBe("");

  act(() => {
    result.current.onTypeChange("EXPENSE");
  });
  act(() => {
    result.current.onParentChange("p");
  });
  act(() => {
    result.current.onOwnerChange("family-1");
  });
  expect(result.current.parentId).toBe("");
});

it("SHOULD keep a stored color outside the palette and not send it WHEN saving untouched", () => {
  givenLoaded({
    categories: [cat("c1", { iconColor: "#123456", name: "Old" })],
    params: { id: "c1" },
  });
  const { result } = setup();

  expect(result.current.iconColor).toBe("#123456");

  act(() => {
    result.current.onNameChange("New");
  });
  act(() => {
    result.current.onSave();
  });

  expect(mutations.update.value.mutate).toHaveBeenCalledWith({
    id: "c1",
    name: "New",
  });
});

it("SHOULD apply a custom color only WHEN it is a valid #RRGGBB", () => {
  givenLoaded();
  const { result } = setup();
  const start = result.current.iconColor;

  act(() => {
    result.current.onCustomColorOpen();
  });
  act(() => {
    result.current.onCustomColorChange("#12345");
  });
  expect(result.current.customColorError).toBe(
    "financial.categories.form.customColorInvalid",
  );
  act(() => {
    result.current.onCustomColorApply();
  });
  expect(result.current.iconColor).toBe(start);

  act(() => {
    result.current.onCustomColorChange("#a1b2c3");
  });
  act(() => {
    result.current.onCustomColorApply();
  });
  expect(result.current.iconColor).toBe("#A1B2C3");
  expect(result.current.isCustomColorOpen).toBe(false);
});

it("SHOULD pick an icon from the sheet and keep it in the form", () => {
  givenLoaded();
  const { result } = setup();

  act(() => {
    result.current.onIconPickerOpen();
  });
  expect(result.current.pickerIcons.length).toBe(18);
  act(() => {
    result.current.onIconQueryChange("heart");
  });
  expect(result.current.pickerIcons.map((icon) => icon.value)).toEqual([
    "heart",
  ]);
  act(() => {
    result.current.onIconChange("heart");
  });

  expect(result.current.icon).toBe("heart");
  expect(result.current.isIconPickerOpen).toBe(false);
  expect(result.current.inlineIcons).toHaveLength(12);
});

it("SHOULD NOT show the name error before the first save and show it live after", () => {
  givenLoaded();
  const { result } = setup();

  expect(result.current.nameError).toBeUndefined();
  act(() => {
    result.current.onSave();
  });
  expect(result.current.nameError).toBe("financial.categories.nameRequired");
  act(() => {
    result.current.onNameChange("Food");
  });
  expect(result.current.nameError).toBeUndefined();
});

it("SHOULD create with depthLevel and the automatic tone of the parent WHEN valid", () => {
  givenLoaded({ categories: [cat("p", { depthLevel: 0 })] });
  const { result } = setup();

  act(() => {
    result.current.onNameChange("Child");
  });
  act(() => {
    result.current.onParentChange("p");
  });
  act(() => {
    result.current.onSave();
  });

  expect(mutations.create.value.mutate).toHaveBeenCalledWith({
    depthLevel: 1,
    icon: "folder",
    iconColor: expect.stringMatching(/^#[0-9A-F]{6}$/),
    name: "Child",
    owner: "USER",
    ownerId: "user-id",
    parentId: "p",
    type: "EXPENSE",
  });
});

it("SHOULD create with the owner and type from the route params", () => {
  givenLoaded({ params: { ownerId: "family-1", type: "INCOME" } });
  const { result } = setup();

  act(() => {
    result.current.onNameChange("Salary");
  });
  act(() => {
    result.current.onSave();
  });

  expect(mutations.create.value.mutate).toHaveBeenCalledWith(
    expect.objectContaining({
      owner: "FAMILY",
      ownerId: "family-1",
      type: "INCOME",
    }),
  );
});

it("SHOULD send parentId null WHEN the parent is removed in edit", () => {
  givenLoaded({
    categories: [cat("p"), cat("c1", { parentId: "p" })],
    params: { id: "c1" },
  });
  const { result } = setup();

  act(() => {
    result.current.onParentChange("");
  });
  act(() => {
    result.current.onSave();
  });

  expect(mutations.update.value.mutate).toHaveBeenCalledWith({
    id: "c1",
    parentId: null,
  });
});

it("SHOULD go back without a request WHEN nothing changed in edit", () => {
  givenLoaded({ categories: [cat("c1")], params: { id: "c1" } });
  const { result } = setup();

  act(() => {
    result.current.onSave();
  });

  expect(mutations.update.value.mutate).not.toHaveBeenCalled();
  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);
});

it("SHOULD go back WHEN a mutation succeeds", () => {
  givenLoaded();
  mutations.create.withStatus("success");

  setup();

  expect(modalNavigation.closeModal).toHaveBeenCalled();
});

it("SHOULD keep the values and expose the 006 key WHEN delete fails with transactions", () => {
  givenLoaded({
    categories: [cat("c1", { name: "Keep" })],
    params: { id: "c1" },
  });
  mutations.delete.withError(new CategoryHasTransactions());
  const { result } = setup();

  expect(result.current.formErrorKey).toBe(
    "financial.categories.errors.hasTransactions",
  );
  expect(result.current.name).toBe("Keep");
});

it("SHOULD ask to discard WHEN dirty and close directly otherwise", () => {
  givenLoaded();
  const { result } = setup();

  act(() => {
    result.current.onClose();
  });
  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);

  act(() => {
    result.current.onNameChange("x");
  });
  act(() => {
    result.current.onClose();
  });
  expect(result.current.isDiscardDialogOpen).toBe(true);
  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(1);

  act(() => {
    result.current.onDiscardConfirm();
  });
  expect(modalNavigation.closeModal).toHaveBeenCalledTimes(2);
});

it("SHOULD confirm delete with the subcategories message WHEN it has children, then delete with id and ownerId", () => {
  givenLoaded({
    categories: [cat("p", { name: "Parent" }), cat("c", { parentId: "p" })],
    params: { id: "p" },
  });
  const { result } = setup();

  expect(result.current.deleteMessageKeys).toEqual([
    "financial.categories.deleteAlertMsg",
    "financial.categories.deleteConfirm.withSubcategories",
  ]);
  expect(result.current.deleteTitleParams).toEqual({ name: "Parent" });

  act(() => {
    result.current.onDeletePress();
  });
  act(() => {
    result.current.onDeleteConfirm();
  });

  expect(mutations.delete.value.mutate).toHaveBeenCalledWith({
    id: "p",
    ownerId: "user-id",
  });
});

describe("archive and reactivate (spec 041)", () => {
  it("SHOULD ask for confirmation, mentioning subcategories only when there are some", () => {
    givenLoaded({
      categories: [cat("parent"), cat("child", { parentId: "parent" })],
      params: { id: "parent" },
    });
    const { result } = setup();

    act(() => result.current.onArchivePress());

    expect(result.current.isArchiveDialogOpen).toBe(true);
    expect(result.current.archiveBodyKeys).toEqual([
      "financial.categories.archive.confirmBody",
      "financial.categories.archive.confirmBodyWithChildren",
    ]);
  });

  it("SHOULD patch only the status WHEN the archive is confirmed", () => {
    givenLoaded({ categories: [cat("c1")], params: { id: "c1" } });
    const { result } = setup();

    act(() => result.current.onArchivePress());
    act(() => result.current.onArchiveConfirm());

    expect(result.current.isArchiveDialogOpen).toBe(false);
    expect(mutations.update.value.mutate).toHaveBeenCalledWith({
      id: "c1",
      status: "ARCHIVED",
    });
  });

  it("SHOULD reactivate right away AND flag an archived category", () => {
    givenLoaded({
      categories: [cat("c1", { status: "ARCHIVED" })],
      params: { id: "c1" },
    });
    const { result } = setup();

    expect(result.current.isArchived).toBe(true);

    act(() => result.current.onReactivatePress());

    expect(mutations.update.value.mutate).toHaveBeenCalledWith({
      id: "c1",
      status: "ACTIVE",
    });
  });

  it("SHOULD expose the pending items (no form error) AND dismiss them", () => {
    givenLoaded({ categories: [cat("c1")], params: { id: "c1" } });
    mutations.update.withError(
      new CategoryHasPendingItems({
        hiddenCount: 1,
        installmentPlans: [
          {
            categoryId: "c1",
            description: "TV",
            id: "p1",
            lastInvoiceMonth: "2027-02",
            remainingInstallments: 4,
          },
        ],
        recurrences: [
          {
            categoryId: "c1",
            description: "Gym",
            id: "r1",
            nextOccurrenceDate: "2026-11-05",
          },
        ],
      }),
    );
    const { result } = setup();

    expect(result.current.formErrorKey).toBeUndefined();
    expect(result.current.pendingItems).toMatchObject({
      hiddenCount: 1,
      plans: [{ count: 4, description: "TV", id: "p1" }],
      recurrences: [{ description: "Gym", id: "r1" }],
    });

    act(() => result.current.onPendingClose());

    expect(result.current.pendingItems).toBeUndefined();
  });

  it("SHOULD show the parent-archived message as the form error", () => {
    givenLoaded({ categories: [cat("c1")], params: { id: "c1" } });
    mutations.update.withError(new CategoryParentArchived());
    const { result } = setup();

    expect(result.current.formErrorKey).toBe(
      "financial.errors.categoryParentArchived",
    );
  });
});

describe("automatic colors (spec 054 FR 14)", () => {
  it("SHOULD give a child the tone of its siblings WHEN a parent is picked", () => {
    givenLoaded({
      categories: [
        cat("p", { iconColor: "#EF4444" }),
        cat("k", { iconColor: "#E21313", parentId: "p" }),
      ],
    });
    const { result } = setup();

    act(() => {
      result.current.onParentChange("p");
    });

    expect(result.current.iconColor).toBe("#E21313");
    expect(result.current.toneOptions).toHaveLength(6);
  });

  it("SHOULD give the first child a new tone of the parent", () => {
    givenLoaded({ categories: [cat("p", { iconColor: "#EF4444" })] });
    const { result } = setup();

    act(() => {
      result.current.onParentChange("p");
    });

    expect(result.current.iconColor).not.toBe("#EF4444");
    expect(result.current.iconColor).toMatch(/^#[0-9A-F]{6}$/);
  });

  it("SHOULD keep a hand-picked color WHEN the parent changes", () => {
    givenLoaded({ categories: [cat("p", { iconColor: "#EF4444" })] });
    const { result } = setup();

    act(() => {
      result.current.onColorChange("#123456");
    });
    act(() => {
      result.current.onParentChange("p");
    });

    expect(result.current.iconColor).toBe("#123456");
  });

  it("SHOULD go back to a root palette color WHEN the parent is removed", () => {
    givenLoaded({ categories: [cat("p", { iconColor: "#EF4444" })] });
    const { result } = setup();

    act(() => {
      result.current.onParentChange("p");
    });
    act(() => {
      result.current.onParentChange("");
    });

    expect(isPaletteColor(result.current.iconColor)).toBe(true);
  });

  it("SHOULD not recolor in edit mode WHEN the parent changes", () => {
    givenLoaded({
      categories: [
        cat("p", { iconColor: "#EF4444" }),
        cat("c", { iconColor: "#123456" }),
      ],
      params: { id: "c" },
    });
    const { result } = setup();

    act(() => {
      result.current.onParentChange("p");
    });

    expect(result.current.iconColor).toBe("#123456");
  });
});
