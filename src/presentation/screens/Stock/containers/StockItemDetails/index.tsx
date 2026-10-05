import { View } from "react-native";

import {
  Badge,
  BottomSheet,
  Button,
  ConfirmDialog,
  ErrorState,
  Text,
} from "@components";
import { useTranslation } from "@presentation/i18n";

import { useStockItemDetailsViewModel } from "./hooks";
import { Props } from "./hooks/useStockItemDetailsViewModel";
import useStyles from "./styles";

function StockItemDetails(props: Props) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const vm = useStockItemDetailsViewModel(props);
  const { item } = props;
  const badge = item.badge;

  function renderRow(label: string, value: string, key: string) {
    return (
      <View key={key} style={styles.row}>
        <Text.Caption value={label} />
        <Text.Body value={value} />
      </View>
    );
  }

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        <Button.Destructive
          fullWidth
          label={t("stock.details.delete")}
          onPress={vm.onDeletePress}
          size="lg"
        />
      }
      onClose={props.onClose}
      title={item.description}
      visible
    >
      {badge ? (
        <Badge label={t(badge.labelKey, badge.params)} tone={badge.tone} />
      ) : null}
      {renderRow(
        t("stock.details.quantity"),
        `${item.quantityDetail.value} ${t(item.quantityDetail.unitKey)}`,
        "quantity",
      )}
      {item.detailRows.map((row) =>
        renderRow(t(row.labelKey), row.value, row.labelKey),
      )}
      {vm.errorKey ? (
        <ErrorState
          message={t(vm.errorKey)}
          onRetry={vm.onConfirmDelete}
          retryLabel={t("common.actions.tryAgain")}
        />
      ) : null}
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("stock.details.delete")}
        loading={vm.isDeleting}
        message={t("stock.details.deleteMessage")}
        onCancel={vm.onCancelDelete}
        onConfirm={vm.onConfirmDelete}
        title={t("stock.details.deleteTitle", { name: item.description })}
        visible={vm.isConfirmOpen}
      />
    </BottomSheet>
  );
}

export default StockItemDetails;
