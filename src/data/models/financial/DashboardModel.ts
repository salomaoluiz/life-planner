import {
  BalanceSeriesEntity,
  DashboardGranularity,
  DashboardSummaryEntity,
  DashboardTotalsEntity,
} from "@domain/entities/financial/DashboardEntity";

type Json = Record<string, unknown>;

// API shapes of `GET /v1/finance/dashboard/*` (spec 046); money stays in cents.
class DashboardModel {
  static balanceSeriesFromJSON(data: Json): BalanceSeriesEntity {
    return {
      currency: data.currency as string,
      granularity: data.granularity as DashboardGranularity,
      points: list(data.points).map((point) => ({
        accounts: list(point.accounts).map((account) => ({
          balance: Number(account.balance),
          id: account.id as string,
          name: account.name as string,
        })),
        balance: Number(point.balance),
        end: point.end as string,
        projected: Boolean(point.projected),
        start: point.start as string,
      })),
    };
  }

  static summaryFromJSON(data: Json): DashboardSummaryEntity {
    const balance = (data.balance ?? {}) as Json;
    const expense = (data.expense ?? {}) as Json;
    const income = (data.income ?? {}) as Json;

    return {
      balance: {
        current: Number(balance.current ?? 0),
        previous: Number(balance.previous ?? 0),
        projectedEnd:
          balance.projectedEnd === null || balance.projectedEnd === undefined
            ? null
            : Number(balance.projectedEnd),
      },
      currencies: list(data.currencies).map((item) => ({
        accounts: Number(item.accounts),
        cards: Number(item.cards),
        code: item.code as string,
      })),
      currency: data.currency as string,
      expense: { ...amounts(expense), previous: Number(expense.previous ?? 0) },
      income: { ...amounts(income), previous: Number(income.previous ?? 0) },
    };
  }

  static totalsFromJSON(data: Json): DashboardTotalsEntity {
    if (data.groupBy === "PERIOD") {
      return {
        bucket: data.bucket as "MONTH" | "WEEK",
        groupBy: "PERIOD",
        items: list(data.items).map((item) => ({
          end: item.end as string,
          expense: amounts(item.expense),
          income: amounts(item.income),
          start: item.start as string,
        })),
      };
    }

    if (data.groupBy === "CATEGORY") {
      return {
        groupBy: "CATEGORY",
        items: list(data.items).map((item) => ({
          ...amounts(item),
          archived: Boolean(item.archived),
          categoryId: item.categoryId as string,
          count: Number(item.count),
          hasChildren: Boolean(item.hasChildren),
          name: item.name as string,
          self: Boolean(item.self),
        })),
        total: Number(data.total ?? 0),
      };
    }

    const untagged = (data.untagged ?? {}) as Json;

    return {
      groupBy: "TAG",
      items: list(data.items).map((item) => ({
        ...amounts(item),
        count: Number(item.count),
        name: item.name as string,
        tagId: item.tagId as string,
      })),
      total: Number(data.total ?? 0),
      untagged: { ...amounts(untagged), count: Number(untagged.count ?? 0) },
    };
  }
}

function amounts(data: unknown) {
  const value = (data ?? {}) as Json;

  return {
    projected: Number(value.projected ?? 0),
    realized: Number(value.realized ?? 0),
  };
}

function list(data: unknown): Json[] {
  return Array.isArray(data) ? (data as Json[]) : [];
}

export default DashboardModel;
