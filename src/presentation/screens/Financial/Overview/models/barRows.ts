import { BarListRow } from "@components";

import { percentOf } from "./overviewFormat";

export interface BarItem {
  archived?: boolean;
  id: string;
  name: string;
  value: number;
}

export const OTHER_ID = "other";
export const UNTAGGED_ID = "untagged";

// The top `top` items (already ordered by amount) plus an "Other" row with the rest. Percent is of `total`.
// `extra` rows (for example "No tag") stay after the folded ones and are never pressable.
function foldBars(params: {
  archivedSuffix?: string;
  extra?: { id: string; name: string; value: number }[];
  format: (value: number) => string;
  items: BarItem[];
  localeTag: string;
  otherLabel: string;
  top: number;
  total: number;
}): BarListRow[] {
  const visible = params.items.filter((item) => item.value > 0);
  const shown = visible.slice(0, params.top);
  const rest = visible.slice(params.top);
  const restValue = rest.reduce((sum, item) => sum + item.value, 0);
  const max = Math.max(
    1,
    ...shown.map((item) => item.value),
    restValue,
    ...(params.extra ?? []).map((item) => item.value),
  );
  function toRow(
    item: BarItem | { id: string; name: string; value: number },
    muted = false,
  ): BarListRow {
    return {
      id: item.id,
      label: item.name,
      muted,
      percent: percentOf(item.value, params.total, params.localeTag),
      ratio: item.value / max,
      suffix:
        "archived" in item && item.archived ? params.archivedSuffix : undefined,
      value: params.format(item.value),
    };
  }

  return [
    ...shown.map((item) => toRow(item)),
    ...(restValue > 0
      ? [
          toRow(
            { id: OTHER_ID, name: params.otherLabel, value: restValue },
            true,
          ),
        ]
      : []),
    ...(params.extra ?? [])
      .filter((item) => item.value > 0)
      .map((item) => toRow(item, true)),
  ];
}

export default foldBars;
