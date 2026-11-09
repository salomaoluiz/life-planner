// What the View (views/Wide.tsx) may import from the ViewModel file.
import useFiltersModalViewModel from "./useFiltersModalViewModel";

export type {
  FiltersModalParams,
  FiltersStep,
  PeriodMode,
} from "./useFiltersModalViewModel";
export type FiltersModalVM = ReturnType<typeof useFiltersModalViewModel>;
