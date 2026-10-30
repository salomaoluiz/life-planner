import { useEffect, useState } from "react";

import CategoryIconDTO from "@application/dto/financial/CategoryIconDTO";
import { useCases } from "@application/useCases";
import { BusinessError, DefaultError } from "@domain/entities/errors";
import { useQuery } from "@infrastructure/fetcher";
import {
  CATEGORY_ICON_GROUPS,
  CategoryIconGroup,
} from "@presentation/constants/categoryIconGroups";

const DEBOUNCE_MS = 250;
const FIVE_MINUTES = 5 * 60 * 1000;

interface IconGroup {
  group: CategoryIconGroup;
  icons: CategoryIconDTO[];
}

type IconSearchStatus = "empty" | "error" | "loading" | "success";

// A failed search is shown inline (with "try again"), so it must be a BusinessError: the fetcher throws any other
// error to the error boundary. The original error stays in the context.
function toInlineError(error: unknown) {
  const inline = new BusinessError();

  inline.addContext({
    cause: error instanceof Error ? error.message : String(error),
    useCase: "financial.getCategoryIconsUseCase",
    ...(error instanceof DefaultError ? error.context : {}),
  });

  return inline;
}

// Spec 058 FR 14: the catalog search of the "More" sheet. Typing is debounced (250 ms); every query has its own
// cache entry, so a slow answer of an older text never replaces the newest one.
function useIconSearch(query: string, enabled: boolean) {
  const text = query.trim();
  const [debounced, setDebounced] = useState(text);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(text), DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [text]);

  const result = useQuery<CategoryIconDTO[]>({
    cacheKey: [useCases.getCategoryIconsUseCase.uniqueName, debounced],
    enabled,
    fetch: async () => {
      try {
        return await useCases.getCategoryIconsUseCase.execute({
          q: debounced || undefined,
        });
      } catch (error) {
        throw toInlineError(error);
      }
    },
    networkMode: "always",
    retry: false,
    staleTime: FIVE_MINUTES,
  });
  const icons = result.data ?? [];
  const isSettling = debounced !== text;

  let status: IconSearchStatus = "success";
  if (result.status === "error") {
    status = "error";
  } else if (result.status === "pending" || (isSettling && !result.data)) {
    status = "loading";
  } else if (icons.length === 0) {
    status = "empty";
  }

  const groups: IconGroup[] = debounced
    ? []
    : CATEGORY_ICON_GROUPS.map((group) => ({
        group,
        icons: icons.filter((icon) => icon.group === group),
      })).filter((entry) => entry.icons.length > 0);

  return {
    debouncedQuery: debounced,
    groups,
    icons,
    retry: async () => result.refetch(),
    status,
  };
}

export type { IconGroup, IconSearchStatus };
export default useIconSearch;
