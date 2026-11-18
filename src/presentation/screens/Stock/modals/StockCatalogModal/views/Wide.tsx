import { View } from "react-native";

import {
  AdaptiveViewProps,
  Badge,
  BottomSheet,
  Button,
  ChipGroup,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FormColumns,
  ListItem,
  SelectField,
  Text,
  TextField,
} from "@components";
import Skeleton from "@components/Skeleton";
import { OwnerType } from "@domain/entities/user/OwnerEntity";
import { useTranslation } from "@presentation/i18n";
import pluralKey from "@presentation/i18n/pluralKey";
import LocationQrSheet from "@screens/Stock/containers/LocationQrSheet";

import { StockCatalogVM } from "../hooks";
import useStyles from "../styles";
import stockCatalogTestIds from "../testIds";

function Wide({ vm }: AdaptiveViewProps<StockCatalogVM>) {
  const { styles } = useStyles();
  const { t } = useTranslation();

  function renderCategories() {
    if (vm.isEmptyCategories) {
      return (
        <EmptyState
          actionLabel={t("stock.catalog.useSuggestions")}
          message={t("stock.catalog.emptyMessageCategories")}
          onAction={vm.onUseCategorySuggestions}
          testID={stockCatalogTestIds.categoriesEmpty}
          title={t("stock.catalog.categoriesEmptyTitle")}
        />
      );
    }

    return vm.categories.map((row) => {
      const archived = row.category.status === "ARCHIVED";
      const finance = row.inherits
        ? t("stock.catalog.inherits")
        : (row.financeLabel ?? t("stock.catalog.noMapping"));

      return (
        <View
          key={row.category.id}
          style={[styles.row, { paddingLeft: row.depth * 24 }]}
          testID={stockCatalogTestIds.categoryRow}
        >
          <ListItem
            subtitle={`${finance} · ${row.category.itemCount}`}
            title={row.category.name}
            trailing={
              archived ? (
                <Badge
                  label={t("stock.catalog.archivedBadge")}
                  tone="neutral"
                />
              ) : undefined
            }
          />
          <View style={styles.actions}>
            <Button.Ghost
              label={t("stock.catalog.rename")}
              onPress={() => vm.onEditCategory(row.category.id)}
            />
            {archived ? (
              <Button.Ghost
                label={t("stock.catalog.reactivate")}
                onPress={() =>
                  vm.onSetStatus("category", row.category.id, false)
                }
              />
            ) : (
              <>
                {row.depth < 2 ? (
                  <Button.Ghost
                    label={t("stock.catalog.subcategory")}
                    onPress={() => vm.onAddCategory(row.category.id)}
                  />
                ) : null}
                <Button.Ghost
                  label={t("stock.catalog.archive")}
                  onPress={() =>
                    vm.onSetStatus("category", row.category.id, true)
                  }
                />
              </>
            )}
            <Button.Ghost
              label={t("stock.catalog.delete")}
              onPress={() =>
                vm.onDelete("category", row.category.id, row.category.name)
              }
              testID={stockCatalogTestIds.deleteButton}
            />
          </View>
        </View>
      );
    });
  }

  function renderLocations() {
    if (vm.isEmptyLocations) {
      return (
        <EmptyState
          actionLabel={t("stock.catalog.useSuggestions")}
          message={t("stock.catalog.emptyMessageLocations")}
          onAction={vm.onUseLocationSuggestions}
          testID={stockCatalogTestIds.locationsEmpty}
          title={t("stock.catalog.locationsEmptyTitle")}
        />
      );
    }

    return vm.locations.map((location) => {
      const archived = location.status === "ARCHIVED";

      return (
        <View
          key={location.id}
          style={styles.row}
          testID={stockCatalogTestIds.locationRow}
        >
          <ListItem
            subtitle={String(location.itemCount)}
            title={location.name}
            trailing={
              archived ? (
                <Badge
                  label={t("stock.catalog.archivedBadge")}
                  tone="neutral"
                />
              ) : undefined
            }
          />
          <View style={styles.actions}>
            <Button.Ghost
              label={t("stock.location.qrTitle")}
              onPress={() => vm.onQrOpen(location.id, location.name)}
              testID={`${stockCatalogTestIds.locationQr}-${location.id}`}
            />
            <Button.Ghost
              label={t("stock.catalog.rename")}
              onPress={() => vm.onEditLocation(location.id)}
            />
            <Button.Ghost
              label={
                archived
                  ? t("stock.catalog.reactivate")
                  : t("stock.catalog.archive")
              }
              onPress={() => vm.onSetStatus("location", location.id, !archived)}
            />
            <Button.Ghost
              label={t("stock.catalog.delete")}
              onPress={() =>
                vm.onDelete("location", location.id, location.name)
              }
            />
          </View>
        </View>
      );
    });
  }

  const isCategoryEditor = vm.editor?.kind === "category";
  const editorTitle = (() => {
    if (!vm.editor) {
      return "";
    }

    if (vm.editor.kind === "category") {
      return t(
        vm.editor.id
          ? "stock.catalog.editCategoryTitle"
          : "stock.catalog.newCategoryTitle",
      );
    }

    return t(
      vm.editor.id
        ? "stock.catalog.editLocationTitle"
        : "stock.catalog.newLocationTitle",
    );
  })();

  return (
    <BottomSheet
      closeLabel={t("common.actions.close")}
      onClose={vm.onClose}
      presentation="inline"
      size="form"
      subtitle={t("stock.catalog.ownerHint")}
      testID={stockCatalogTestIds.sheet}
      title={t("stock.catalog.title")}
      visible
    >
      {vm.isLoading ? (
        <Skeleton.ListItem />
      ) : (
        <View style={styles.content}>
          <ChipGroup
            label={t("stock.catalog.owner")}
            mode="single"
            onChange={vm.onOwnerChange}
            options={vm.ownerOptions.map((owner) => ({
              label:
                owner.type === OwnerType.USER
                  ? t("stock.list.filter.personal")
                  : owner.name,
              value: owner.id,
            }))}
            testID={stockCatalogTestIds.owner}
            value={vm.owner?.id}
          />
          {vm.inUseCount !== undefined ? (
            <Text.Caption
              testID={stockCatalogTestIds.inUse}
              tone="expense"
              value={t(pluralKey("stock.catalog.inUse", vm.inUseCount), {
                count: vm.inUseCount,
              })}
            />
          ) : null}
          {vm.hasError ? (
            <ErrorState
              message={t("common.errors.generic")}
              onRetry={vm.onRetry}
              retryLabel={t("common.actions.tryAgain")}
            />
          ) : null}
          <FormColumns
            left={
              <>
                <View style={styles.sectionHeader}>
                  <Text.Heading value={t("stock.catalog.categories")} />
                  <Button.Secondary
                    label={t("stock.catalog.addCategory")}
                    onPress={() => vm.onAddCategory()}
                    testID={stockCatalogTestIds.addCategory}
                  />
                </View>
                {renderCategories()}
                <Text.Caption value={t("stock.catalog.categoryHint")} />
              </>
            }
            right={
              <>
                <View style={styles.sectionHeader}>
                  <Text.Heading value={t("stock.catalog.locations")} />
                  <Button.Secondary
                    label={t("stock.catalog.addLocation")}
                    onPress={vm.onAddLocation}
                    testID={stockCatalogTestIds.addLocation}
                  />
                </View>
                {renderLocations()}
                <Text.Caption value={t("stock.catalog.nothingAutomatic")} />
              </>
            }
            testID={stockCatalogTestIds.sheet}
          />
        </View>
      )}
      <BottomSheet
        closeLabel={t("common.actions.close")}
        footer={
          <Button.Primary
            fullWidth
            label={t("stock.catalog.save")}
            loading={vm.isBusy}
            onPress={vm.onSaveEditor}
            size="lg"
            testID={stockCatalogTestIds.saveButton}
          />
        }
        onClose={vm.onEditorClose}
        testID={stockCatalogTestIds.editor}
        title={editorTitle}
        visible={vm.editor !== undefined}
      >
        <TextField
          label={t("stock.catalog.name")}
          onChangeText={vm.onNameChange}
          testID={stockCatalogTestIds.nameInput}
          value={vm.name}
        />
        {isCategoryEditor ? (
          <>
            <SelectField
              closeLabel={t("common.actions.close")}
              label={t("stock.catalog.parent")}
              onChange={vm.onParentChange}
              options={[
                { label: t("stock.catalog.noParent"), value: "" },
                ...vm.parentOptions.filter(
                  (option) => option.value !== vm.editor?.id,
                ),
              ]}
              sheetTitle={t("stock.catalog.parent")}
              value={vm.parentId}
            />
            <SelectField
              closeLabel={t("common.actions.close")}
              label={t("stock.catalog.financeMapping")}
              onChange={vm.onFinanceChange}
              options={[
                { label: t("stock.catalog.noFinance"), value: "" },
                ...vm.financeOptions,
              ]}
              sheetTitle={t("stock.catalog.financeMapping")}
              testID={stockCatalogTestIds.financeSelect}
              value={vm.selectedFinanceId}
            />
          </>
        ) : null}
      </BottomSheet>
      <ConfirmDialog
        cancelLabel={t("common.actions.cancel")}
        closeLabel={t("common.actions.close")}
        confirmLabel={t("stock.catalog.delete")}
        loading={vm.isBusy}
        message={t("stock.catalog.deleteMessage")}
        onCancel={vm.onCancelDelete}
        onConfirm={vm.onConfirmDelete}
        testID={stockCatalogTestIds.deleteDialog}
        title={t("stock.catalog.deleteTitle", {
          name: vm.toDelete?.name ?? "",
        })}
        visible={vm.toDelete !== undefined}
      />
      {vm.qrLocation ? (
        <LocationQrSheet location={vm.qrLocation} onClose={vm.onQrClose} />
      ) : null}
    </BottomSheet>
  );
}

export default Wide;
