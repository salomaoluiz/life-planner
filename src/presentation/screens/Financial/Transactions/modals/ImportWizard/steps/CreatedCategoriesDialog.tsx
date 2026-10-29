import { View } from "react-native";

import {
  BottomSheet,
  Button,
  Divider,
  FormColumns,
  IconTile,
  Text,
} from "@components";
import { IconButton } from "@components/Icon";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import useStyles from "../styles";
import useValuesStepViewModel from "./useValuesStepViewModel";

const ids = transactionsTestIds;

type ValuesViewModel = ReturnType<typeof useValuesStepViewModel>;

// Spec 054 FR 5-9: the categories created in this import and the confirmation to delete one (artboards "Criadas neste
// import" and "Excluir categoria criada"): list and details in two columns on wide screens, one stack on compact.
function CreatedCategoriesDialog(props: { vm: ValuesViewModel }) {
  const { vm } = props;
  const { styles } = useStyles();
  const { t } = useTranslation();
  const { spacing } = useKitTheme();
  const dialog = vm.dialog;
  const plan = vm.deletePlan;

  function list() {
    return (
      <View>
        <Text.Caption
          tone={"secondary"}
          value={t("financial.import.values.created.hint")}
        />
        {vm.createdItems.map((item) => (
          <View key={item.id}>
            <View
              style={[
                styles.createdRow,
                { paddingLeft: spacing.md * item.depth },
              ]}
            >
              <IconTile
                color={item.iconColor}
                name={"shape-outline"}
                size={"sm"}
              />
              <View style={styles.createdMeta}>
                <Text.Body value={item.path} />
                <Text.Caption
                  tone={"secondary"}
                  value={t("financial.import.values.created.meta", {
                    children: item.childCount,
                    values: item.valuesCount,
                  })}
                />
              </View>
              <IconButton
                accessibilityLabel={t("financial.import.values.created.delete")}
                name={"trash-can-outline"}
                onPress={() => vm.onDeleteOpen(item.id)}
                testID={`${ids.importCreatedDelete}.${item.id}`}
              />
            </View>
            <Divider />
          </View>
        ))}
      </View>
    );
  }

  function details() {
    if (!plan || !vm.deleteItem) {
      return (
        <Text.Caption
          tone={"secondary"}
          value={t("financial.import.values.created.pick")}
        />
      );
    }

    return (
      <View style={styles.stack}>
        <Text.Heading
          value={t("financial.import.values.created.confirmTitle", {
            path: plan.path,
          })}
        />
        <Text.Body value={t("financial.import.values.created.confirmBody")} />
        {plan.names.length > 0 ? (
          <Text.Body
            tone={"secondary"}
            value={t("financial.import.values.created.confirmChildren", {
              names: plan.names.join(", "),
            })}
          />
        ) : null}
        {plan.affectedValues.length > 0 ? (
          <View style={styles.section}>
            <Text.Caption
              tone={"secondary"}
              value={t("financial.import.values.created.unmatchedNote")}
            />
            {plan.affectedValues.map((entry) => (
              <Text.Body
                key={entry.key}
                value={`${entry.value} · ${entry.rows}`}
              />
            ))}
          </View>
        ) : null}
        {vm.deleteFailed ? (
          <View accessibilityRole={"alert"}>
            <Text.Caption
              testID={ids.importDeleteError}
              tone={"expense"}
              value={t("financial.import.values.created.deleteFailed")}
            />
          </View>
        ) : null}
        <View style={styles.row}>
          <View style={styles.grow}>
            <Button.Secondary
              fullWidth
              label={t("common.actions.cancel")}
              onPress={vm.onDeleteCancel}
              testID={ids.importDeleteCancel}
            />
          </View>
          <View style={styles.grow}>
            <Button.Destructive
              fullWidth
              label={t(
                pluralKey(
                  "financial.import.values.created.confirmAction",
                  plan.ids.length,
                ),
                { count: plan.ids.length },
              )}
              loading={vm.isDeleting}
              onPress={vm.onDeleteConfirm}
              testID={ids.importDeleteConfirm}
            />
          </View>
        </View>
      </View>
    );
  }

  return (
    <BottomSheet
      closeLabel={t("financial.import.close")}
      onClose={dialog?.list ? vm.onCreatedClose : vm.onDeleteCancel}
      size={"form"}
      testID={ids.importCreatedDialog}
      title={
        dialog?.list
          ? t("financial.import.values.created.title", {
              count: vm.createdItems.length,
            })
          : t("financial.import.values.created.delete")
      }
      visible={!!dialog}
    >
      {dialog?.list ? (
        <FormColumns
          left={list()}
          right={details()}
          testID={ids.importCreatedDialog}
        />
      ) : (
        details()
      )}
    </BottomSheet>
  );
}

export default CreatedCategoriesDialog;
