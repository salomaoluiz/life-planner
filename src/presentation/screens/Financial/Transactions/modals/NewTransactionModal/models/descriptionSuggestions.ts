import TransactionUIModel from "@screens/Financial/Transactions/models/TransactionUIModel";

// Spec 060 FR 3 / 6: the list opens from 2 characters, at most 6 rows.
const MIN_QUERY = 2;
const MAX_SUGGESTIONS = 6;

interface DescriptionSuggestion {
  categoryColor?: string;
  categoryIcon: string;
  // The group key (the normalized description).
  id: string;
  label: string;
  // Where the typed text sits in `label` (to show it in bold).
  matchRange: [number, number];
  // The most recent transaction of the group: what picking fills in.
  template: TransactionUIModel;
  type: "EXPENSE" | "INCOME";
}

interface Group {
  count: number;
  matchRange: [number, number];
  startsWith: boolean;
  template: TransactionUIModel;
}

function buildDescriptionSuggestions(params: {
  archivedOwnerIds: Set<string>;
  items: TransactionUIModel[];
  query: string;
}): DescriptionSuggestion[] {
  const query = normalizeText(params.query.trim());

  if (Array.from(query).length < MIN_QUERY) {
    return [];
  }

  const groups = new Map<string, Group>();

  for (const item of params.items) {
    if (
      item.dto.systemKey ||
      item.isProjected ||
      params.archivedOwnerIds.has(item.ownerId)
    ) {
      continue;
    }

    const match = findMatch(item.description, query);

    if (!match) {
      continue;
    }

    const key = groupKey(item);
    const group = groups.get(key);

    if (!group) {
      groups.set(key, {
        count: 1,
        matchRange: match,
        startsWith: normalizeText(item.description.trim()).startsWith(query),
        template: item,
      });
    } else {
      group.count += 1;
      if (item.date.getTime() > group.template.date.getTime()) {
        group.template = item;
        group.matchRange = match;
      }
    }
  }

  return [...groups.entries()]
    .sort(
      ([, a], [, b]) =>
        Number(b.startsWith) - Number(a.startsWith) ||
        b.count - a.count ||
        b.template.date.getTime() - a.template.date.getTime(),
    )
    .slice(0, MAX_SUGGESTIONS)
    .map(([id, group]) => ({
      categoryColor: group.template.categoryColor,
      categoryIcon: group.template.categoryIcon,
      id,
      label: group.template.description,
      matchRange: group.matchRange,
      template: group.template,
      type: group.template.amountType,
    }));
}

// Returns where `query` (already normalized) sits in `text`, in the indexes of the original text.
function findMatch(text: string, query: string): [number, number] | undefined {
  const positions: number[] = [];
  let normalized = "";

  Array.from(text).forEach((char, index) => {
    const part = normalizeChar(char);

    for (let i = 0; i < part.length; i += 1) {
      positions.push(index);
    }
    normalized += part;
  });

  const at = normalized.indexOf(query);

  if (at < 0) {
    return undefined;
  }

  return [positions[at], positions[at + query.length - 1] + 1];
}

// One suggestion per description: the same text on other accounts, cards or categories is the same suggestion.
function groupKey(item: TransactionUIModel) {
  return normalizeText(item.description.trim());
}

// Lower case and without accents, character by character so positions map back to the original text.
function normalizeChar(char: string) {
  return char.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function normalizeText(value: string) {
  return Array.from(value).map(normalizeChar).join("");
}

export type { DescriptionSuggestion };
export { buildDescriptionSuggestions, MAX_SUGGESTIONS, normalizeText };
