import { useState } from "react";
import { View } from "react-native";

import {
  OptionRow,
  RemovableChip,
  ResultsPanel,
  SearchField,
  Text,
} from "@components";
import { useTranslation } from "@presentation/i18n";
import {
  CategoryResult,
  CategorySearchEntry,
} from "@screens/Financial/Transactions/models/categoryPicker";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import useStyles from "./styles";

const ROW_HEIGHT = 56;

export interface CategorySearchFieldProps {
  chips: { iconColor?: string; id: string; label: string; type: string }[];
  // Wide: the results float under the field; compact: they sit inline.
  dropdown: boolean;
  onPick: (id: string) => void;
  onQueryChange: (query: string) => void;
  onRemove: (id: string) => void;
  query: string;
  results: CategoryResult[];
}

const ids = transactionsTestIds;

// The Categories section of the Filters modal (spec 051 FR 1-10): search, results, chips.
function CategorySearchField(props: CategorySearchFieldProps) {
  const { t } = useTranslation();
  const { styles } = useStyles();
  const [highlight, setHighlight] = useState(-1);
  const [dismissedFor, setDismissedFor] = useState<string>();
  const open = props.query.trim() !== "" && dismissedFor !== props.query;
  const enabled = props.results.filter((item) => !item.coveredBy);

  function secondLine(item: CategoryResult) {
    const { entry } = item;

    if (item.coveredBy) {
      return t("financial.transactions.filters.categories.includedIn", {
        name: item.coveredBy,
      });
    }
    if (entry.category.parentId) {
      return entry.path;
    }

    return entry.childCount > 0
      ? t("financial.transactions.filters.categories.includes", {
          count: entry.descendantCount,
        })
      : undefined;
  }

  function badge(entry: CategorySearchEntry) {
    if (entry.category.archived) {
      return {
        label: t("financial.transactions.filters.categories.archivedBadge"),
        tone: "neutral",
      } as const;
    }
    const income = entry.category.type === "INCOME";

    return {
      label: t(
        income
          ? "financial.transactions.filters.categories.typeIncome"
          : "financial.transactions.filters.categories.typeExpense",
      ),
      tone: income ? "income" : "expense",
    } as const;
  }

  function change(text: string) {
    setHighlight(-1);
    props.onQueryChange(text);
  }

  function pick(id: string) {
    setHighlight(-1);
    props.onPick(id);
  }

  function keyPress(key: string) {
    if (key === "ArrowDown") {
      setHighlight((current) => (current + 1) % Math.max(enabled.length, 1));
    } else if (key === "ArrowUp") {
      setHighlight((current) =>
        current <= 0 ? enabled.length - 1 : current - 1,
      );
    } else if (key === "Escape") {
      setDismissedFor(props.query);
    }
  }

  function submit() {
    const chosen = enabled[Math.max(highlight, 0)];

    if (open && chosen) {
      pick(chosen.entry.category.id);
    }
  }

  function row(item: CategoryResult) {
    const { entry } = item;

    return (
      <OptionRow
        accessibilityLabel={entry.path}
        active={!item.coveredBy && enabled[highlight] === item}
        badge={badge(entry)}
        bullet={entry.category.iconColor}
        disabled={!!item.coveredBy}
        key={entry.category.id}
        muted={entry.category.archived}
        onPress={() => pick(entry.category.id)}
        subtitle={secondLine(item)}
        testID={`${ids.filtersCategory}-${entry.category.id}`}
        title={entry.category.name}
        typeDot={entry.category.type === "INCOME" ? "income" : "expense"}
      />
    );
  }

  return (
    <View
      style={[
        styles.root,
        open && props.dropdown && props.results.length > 0
          ? { paddingBottom: props.results.length * ROW_HEIGHT }
          : undefined,
      ]}
    >
      <View style={styles.searchWrap}>
        <SearchField
          clearLabel={t("common.actions.clear")}
          onChangeText={change}
          onKeyPress={keyPress}
          onSubmitEditing={submit}
          placeholder={t("financial.transactions.filters.categories.search")}
          testID={`${ids.filtersSection}.categories-search`}
          value={props.query}
        />
        {open ? (
          <ResultsPanel
            floating={props.dropdown}
            testID={`${ids.filtersSection}.categories-results`}
          >
            {props.results.length === 0 ? (
              <View style={styles.empty}>
                <Text.Body
                  testID={`${ids.filtersSection}.categories-empty`}
                  tone={"secondary"}
                  value={t(
                    "financial.transactions.filters.categories.noResults",
                  )}
                />
              </View>
            ) : (
              props.results.map(row)
            )}
          </ResultsPanel>
        ) : null}
      </View>
      {props.chips.length > 0 ? (
        <View style={styles.chips}>
          {props.chips.map((chip) => (
            <RemovableChip
              dotColor={chip.iconColor}
              key={chip.id}
              label={chip.label}
              onRemove={() => props.onRemove(chip.id)}
              removeLabel={t("common.autocompleteField.remove", {
                label: chip.label,
              })}
              testID={`${ids.filtersCategoryChip}-${chip.id}`}
              typeDot={chip.type === "INCOME" ? "income" : "expense"}
            />
          ))}
        </View>
      ) : null}
      <Text.Caption
        tone={"secondary"}
        value={t("financial.transactions.filters.categories.help")}
      />
    </View>
  );
}

export default CategorySearchField;
