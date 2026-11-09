import useAdjustmentSheet from "./useAdjustmentSheet";
import useCsvActions from "./useCsvActions";
import useFilterOptions from "./useFilterOptions";
import usePayTransaction from "./usePayTransaction";
import useTransactionsViewModel from "./useTransactionsViewModel";

export type TransactionsScreenVM = ReturnType<
  typeof useTransactionsScreenViewModel
>;

// The list view model plus the screen-level flows (adjustment sheet, pay, CSV, filter options) the View only renders.
function useTransactionsScreenViewModel() {
  const list = useTransactionsViewModel();
  const adjustment = useAdjustmentSheet();
  const pay = usePayTransaction();
  const csv = useCsvActions();
  const filterOptions = useFilterOptions(
    list.allOwnerIds,
    list.filterCount > 0,
  );

  return { ...list, adjustment, csv, filterOptions, pay };
}

export default useTransactionsScreenViewModel;
