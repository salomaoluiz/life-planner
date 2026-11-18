import { View } from "react-native";

import {
  AdaptiveViewProps,
  BottomSheet,
  Button,
  Card,
  FormColumns,
  SelectField,
  StatusBanner,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import QuantityField from "@screens/Stock/components/QuantityField";

import { AddToListVM } from "../hooks";
import useStyles from "../styles";
import addToListTestIds from "../testIds";

function Wide({ vm }: AdaptiveViewProps<AddToListVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { item } = vm;

  function renderBody() {
    if (vm.isLoading || !item) {
      return <Skeleton.ListItem />;
    }

    if (vm.notOffered) {
      return (
        <StatusBanner
          message={t("stock.lists.notOffered")}
          testID={addToListTestIds.notOffered}
        />
      );
    }

    return (
      <FormColumns
        left={
          <View style={styles.column}>
            <Card>
              <Text.Heading value={item.description} />
              {item.category ? (
                <Text.Caption value={item.category.path} />
              ) : null}
              <View style={styles.stockLine}>
                <Text.Caption
                  value={`${t("stock.lists.itemHas")}: ${item.quantity}`}
                />
                {item.minQuantity !== undefined ? (
                  <Text.Caption
                    value={`${t("stock.lists.itemMin")}: ${item.minQuantity}`}
                  />
                ) : null}
                {item.idealQuantity !== undefined ? (
                  <Text.Caption
                    value={`${t("stock.lists.itemIdeal")}: ${item.idealQuantity}`}
                  />
                ) : null}
              </View>
            </Card>
          </View>
        }
        right={
          <View style={styles.column}>
            <SelectField
              closeLabel={t("common.actions.close")}
              label={t("stock.lists.listLabel")}
              onChange={vm.onListChange}
              options={vm.listOptions}
              sheetTitle={t("stock.lists.listLabel")}
              testID={addToListTestIds.list}
              value={vm.selectedListId}
            />
            <QuantityField
              helper={t("stock.lists.quantitySuggested")}
              input={vm.quantity}
              label={t("stock.lists.quantity")}
              onChange={vm.onQuantityChange}
              testID={addToListTestIds.quantity}
              unit={item.unit}
            />
            {vm.merge ? (
              <StatusBanner
                message={t("stock.lists.merge", vm.merge)}
                testID={addToListTestIds.mergeNotice}
              />
            ) : null}
            {vm.failed ? (
              <StatusBanner message={t("common.errors.generic")} />
            ) : null}
          </View>
        }
      />
    );
  }

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        vm.notOffered ? undefined : (
          <Button.Primary
            disabled={vm.saving || !vm.selectedListId}
            label={t("stock.lists.add")}
            onPress={vm.onSubmit}
            testID={addToListTestIds.submit}
          />
        )
      }
      footerSecondary={
        <Button.Secondary
          label={t("common.actions.cancel")}
          onPress={vm.onClose}
          testID={addToListTestIds.cancel}
        />
      }
      onClose={vm.onClose}
      presentation="inline"
      size="form"
      testID={addToListTestIds.sheet}
      title={t("stock.lists.addTitle")}
      visible
    >
      {renderBody()}
    </BottomSheet>
  );
}

export default Wide;
