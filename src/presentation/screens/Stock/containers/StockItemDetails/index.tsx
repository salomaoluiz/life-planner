import { BottomSheet } from "@components";
import { useTranslation } from "@presentation/i18n";
import StockItemUIModel from "@screens/Stock/models/StockItemUIModel";

interface Props {
  item: StockItemUIModel;
  onClose: () => void;
  onDeleted: () => void;
}

// Minimal host for the details sheet; the content, edit and delete land in the details container task
function StockItemDetails({ item, onClose }: Props) {
  const { t } = useTranslation();

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      onClose={onClose}
      title={item.description}
      visible
    >
      {null}
    </BottomSheet>
  );
}

export default StockItemDetails;
