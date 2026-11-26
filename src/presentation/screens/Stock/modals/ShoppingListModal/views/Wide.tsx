import { View } from "react-native";

import {
  AdaptiveViewProps,
  BottomSheet,
  Button,
  Callout,
  Card,
  ChipGroup,
  FormColumns,
  StatusBanner,
  SwitchRow,
  Text,
  TextField,
} from "@components";
import Skeleton from "@components/Skeleton";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useTranslation } from "@presentation/i18n";

import { ShoppingListVM } from "../hooks";
import useStyles from "../styles";
import shoppingListModalTestIds from "../testIds";

function Wide({ vm }: AdaptiveViewProps<ShoppingListVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();
  function nameErrorText() {
    if (vm.errorKey === "stock.lists.nameTaken") {
      return t("stock.lists.nameTaken");
    }

    return vm.nameError ? t(vm.nameError) : undefined;
  }

  const ownerLabel = vm.ownerName ?? t("stock.lists.filters.personal");

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      footer={
        <Button.Primary
          disabled={vm.saving}
          label={t("stock.lists.save")}
          onPress={vm.onSubmit}
          testID={shoppingListModalTestIds.submit}
        />
      }
      footerSecondary={
        <Button.Secondary
          label={t("common.actions.cancel")}
          onPress={vm.onClose}
          testID={shoppingListModalTestIds.cancel}
        />
      }
      footerStart={
        vm.isEdit ? (
          <View style={styles.footerStart}>
            <Button.Ghost
              disabled={!vm.canArchive || vm.saving}
              label={t("stock.lists.archive")}
              onPress={vm.onArchive}
              testID={shoppingListModalTestIds.archive}
            />
            <Text.Caption
              testID={shoppingListModalTestIds.archiveHint}
              value={
                vm.canArchive
                  ? t("stock.lists.archiveHint")
                  : t("stock.lists.archiveDefaultBlocked")
              }
            />
          </View>
        ) : undefined
      }
      onClose={vm.onClose}
      presentation="inline"
      size="form"
      testID={shoppingListModalTestIds.sheet}
      title={t(vm.isEdit ? "stock.lists.editTitle" : "stock.lists.newTitle")}
      visible
    >
      {vm.isLoading ? (
        <Skeleton.ListItem />
      ) : (
        <FormColumns
          left={
            <View style={styles.column}>
              <TextField
                error={nameErrorText()}
                label={t("stock.lists.name")}
                maxLength={50}
                onChangeText={vm.onNameChange}
                testID={shoppingListModalTestIds.name}
                value={vm.currentName}
              />
              {vm.isEdit ? (
                <TextField
                  error={vm.intervalError ? t(vm.intervalError) : undefined}
                  helper={t("stock.lists.intervalHelper")}
                  keyboardType="number-pad"
                  label={`${t("stock.lists.interval")} (${t("stock.lists.intervalDays")})`}
                  maxLength={2}
                  onChangeText={vm.onIntervalChange}
                  testID={shoppingListModalTestIds.interval}
                  value={vm.currentIntervalText}
                />
              ) : null}
              {vm.isEdit ? (
                <TextField
                  disabled
                  helper={t("stock.lists.ownerHint")}
                  label={t("stock.lists.owner")}
                  onChangeText={() => undefined}
                  testID={shoppingListModalTestIds.owner}
                  value={ownerLabel}
                />
              ) : (
                <ChipGroup
                  label={t("stock.lists.owner")}
                  mode="single"
                  onChange={vm.onOwnerChange}
                  options={vm.ownerOptions.map((owner) => ({
                    label:
                      owner.type === OwnerType.USER
                        ? t("stock.lists.filters.personal")
                        : owner.name,
                    value: owner.id,
                  }))}
                  testID={shoppingListModalTestIds.owner}
                  value={vm.selectedOwnerId}
                />
              )}
            </View>
          }
          right={
            <View style={styles.column}>
              <SwitchRow
                hint={
                  vm.defaultListName
                    ? t("stock.lists.setDefaultHint", {
                        name: vm.defaultListName,
                      })
                    : undefined
                }
                label={t("stock.lists.setDefault", { owner: ownerLabel })}
                onToggle={vm.onDefaultChange}
                testID={shoppingListModalTestIds.default}
                value={vm.isDefault}
              />
              {vm.suggestedInterval === undefined ? null : (
                <Callout
                  testID={shoppingListModalTestIds.suggestion}
                  tone="warning"
                >
                  <Text.BodyStrong
                    value={t("stock.lists.suggestedInterval", {
                      count: vm.suggestedInterval,
                    })}
                  />
                  <Button.Secondary
                    label={t("stock.lists.useSuggested", {
                      count: vm.suggestedInterval,
                    })}
                    onPress={vm.onUseSuggested}
                    testID={shoppingListModalTestIds.useSuggested}
                  />
                </Callout>
              )}
              {vm.isEdit && vm.nextTripDate ? (
                <View testID={shoppingListModalTestIds.nextTrip}>
                  <Text.Caption value={t("stock.lists.nextTripTitle")} />
                  <Text.Body
                    value={vm.nextTripDate.toLocaleDateString(vm.languageTag, {
                      day: "2-digit",
                      month: "2-digit",
                    })}
                  />
                </View>
              ) : null}
              <Card variant="dashed">
                <Text.BodyStrong value={t("stock.lists.marketPlaceholder")} />
                <Text.Caption value={t("stock.lists.marketPlaceholderHint")} />
              </Card>
              {vm.errorKey === "common.errors.generic" ? (
                <StatusBanner message={t("common.errors.generic")} />
              ) : null}
            </View>
          }
        />
      )}
    </BottomSheet>
  );
}

export default Wide;
