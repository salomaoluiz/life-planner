import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { useCases } from "@application/useCases";
import {
  Button,
  Card,
  DatePicker,
  HelperText,
  Picker,
  Spacer,
  Text,
  TextInput,
} from "@components";
import { TransactionType } from "@domain/entities/financial/TransactionEntity";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import useFinancialErrorFeedback from "@screens/Financial/hooks/useFinancialErrorFeedback";

import useForm from "./hooks/useForm";
import NewTransactionItemViewModel from "./models/NewTransactionViewModel";
import getStyles from "./styles";

function NewTransactionItemModal() {
  const { styles, theme } = getStyles();
  const owners = useQuery({
    cacheKey: [useCases.getOwnersUseCase.uniqueName],
    fetch: useCases.getOwnersUseCase.execute,
  });
  const categories = useQuery({
    cacheKey: [useCases.getFinancialCategoriesUseCase.uniqueName],
    fetch: async () => {
      const owner = await useCases.getOwnersUseCase.execute();
      const ownerIds = owner.map((o) => o.id);
      return useCases.getFinancialCategoriesUseCase.execute(ownerIds);
    },
  });
  const accounts = useQuery({
    cacheKey: [useCases.getFinancialAccountsUseCase.uniqueName],
    fetch: async () => {
      const owner = await useCases.getOwnersUseCase.execute();
      const ownerIds = owner.map((o) => o.id);
      return useCases.getFinancialAccountsUseCase.execute(ownerIds);
    },
  });

  const { errors, fields, validateForm } = useForm();

  const addTransaction = useMutation({
    cacheKey: [useCases.createFinancialTransactionUseCase.uniqueName],
    fetch: useCases.createFinancialTransactionUseCase.execute,
  });

  useFinancialErrorFeedback(addTransaction.error);

  const newTransactionItemModel = useMemo(
    () =>
      owners.data && categories.data && accounts.data
        ? new NewTransactionItemViewModel({
            accountsDTO: accounts.data,
            categoriesDTO: categories.data,
            ownersDTO: owners.data,
          })
        : null,
    [owners.data, categories.data, accounts.data],
  );

  const activeOwnerId =
    fields.ownerId.value ?? (owners.data ? owners.data[0].id : undefined);

  // The API rejects a category whose type differs from the transaction type.
  const activeType = fields.type.value ?? TransactionType.EXPENSE;

  useEffect(() => {
    if (newTransactionItemModel && activeOwnerId) {
      const ownerCategories = newTransactionItemModel.categoriesForOwner(
        activeOwnerId,
        activeType,
      );
      const ownerAccounts =
        newTransactionItemModel.accountsForOwner(activeOwnerId);

      const currentCategoryIsValid = ownerCategories.some(
        (c) => c.value === fields.categoryId.value,
      );
      if (ownerCategories.length === 0) {
        // No category of this type for the owner: drop a stale choice so the form asks for one.
        if (fields.categoryId.value) {
          fields.categoryId.onChange(undefined);
          fields.category.onChange(undefined);
        }
      } else if (!fields.categoryId.value || !currentCategoryIsValid) {
        fields.categoryId.onChange(ownerCategories[0].value);
        fields.category.onChange(ownerCategories[0].label);
      }

      const currentAccountIsValid = ownerAccounts.some(
        (a) => a.value === fields.accountId.value,
      );
      if (
        ownerAccounts.length > 0 &&
        (!fields.accountId.value || !currentAccountIsValid)
      ) {
        fields.accountId.onChange(ownerAccounts[0].value);
      }
    }
  }, [newTransactionItemModel, activeOwnerId, activeType]);

  useEffect(() => {
    if (addTransaction.status === "success") {
      router.back();
    }
  }, [addTransaction.status]);

  if (
    owners.isFetching ||
    categories.isFetching ||
    accounts.isFetching ||
    !newTransactionItemModel
  ) {
    return (
      <View>
        <Text.Headline value={"Loading"} />
      </View>
    );
  }

  function onCancel() {
    if (router.canGoBack()) {
      return router.back();
    }
    return router.replace("/financial");
  }

  function onAdd() {
    const params = validateForm(owners.data!);
    if (params) {
      addTransaction.mutate(params);
    }
  }

  return (
    <>
      <Pressable onPress={onCancel} style={styles.backdrop} />
      <Card customStyles={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.titleContainer}>
            <Text.Headline value={"Add new Transaction"} />
          </View>
          <Spacer direction={"vertical"} size={"medium"} />
          <View style={styles.lineContainer}>
            <TextInput.Outlined
              label={fields.description.label}
              onChangeText={fields.description.onChange}
              value={fields.description.value}
            />
          </View>
          <HelperText
            label={errors["description"]}
            type={"error"}
            visible={!!errors["description"]}
          />
          <Spacer direction={"vertical"} size={"medium"} />
          <View style={styles.lineContainer}>
            <View style={styles.helperTextContainer}>
              <TextInput.Outlined
                label={fields.value.label}
                onChangeText={fields.value.onChange}
                value={fields.value.value ?? ""}
              />
              <HelperText
                label={errors["value"]}
                type={"error"}
                visible={!!errors["value"]}
              />
            </View>
            <Spacer direction={"horizontal"} size={"medium"} />
            <View style={styles.helperTextContainer}>
              <Picker
                items={newTransactionItemModel.transactionTypes}
                onValueChange={(value) => {
                  fields.type.onChange(value);
                }}
                selectedValue={fields.type.value}
              />
              <HelperText
                label={errors["type"]}
                type={"error"}
                visible={!!errors["type"]}
              />
            </View>
          </View>
          <Spacer direction={"vertical"} size={"medium"} />
          <Picker
            items={newTransactionItemModel.stockOwners}
            label={fields.owner.label}
            onValueChange={(value) => {
              fields.ownerId.onChange(value);
              fields.owner.onChange(newTransactionItemModel.ownerType(value!));
            }}
            selectedValue={fields.ownerId.value}
          />
          <HelperText
            label={errors["owner"]}
            type={"error"}
            visible={!!errors["owner"]}
          />
          <Spacer direction={"vertical"} size={"medium"} />
          <View style={styles.lineContainer}>
            <Spacer direction={"horizontal"} size={"medium"} />
            <View style={styles.helperTextContainer}>
              <DatePicker
                date={fields.transactionDate.value}
                label={fields.transactionDate.label}
                mode={"single"}
                onConfirm={({ date }) => {
                  fields.transactionDate.onChange(date);
                }}
              />
              <HelperText
                label={errors["transactionDate"]}
                type={"error"}
                visible={!!errors["transactionDate"]}
              />
            </View>
          </View>
          <Spacer direction={"vertical"} size={"medium"} />
          <Picker
            items={newTransactionItemModel.accountsForOwner(
              activeOwnerId ?? "",
            )}
            label={"Account"}
            onValueChange={(value) => {
              fields.accountId.onChange(value);
            }}
            selectedValue={fields.accountId.value}
          />
          <HelperText
            label={errors["accountId"]}
            type={"error"}
            visible={!!errors["accountId"]}
          />
          <Spacer direction={"vertical"} size={"medium"} />
          <Picker
            items={newTransactionItemModel.categoriesForOwner(
              activeOwnerId ?? "",
              activeType,
            )}
            label={"Category"}
            onValueChange={(value) => {
              fields.categoryId.onChange(value);
              const name = newTransactionItemModel
                .categoriesForOwner(activeOwnerId ?? "", activeType)
                .find((c) => c.value === value)?.label;
              fields.category.onChange(name);
            }}
            selectedValue={fields.categoryId.value}
          />
          <HelperText
            label={errors["categoryId"]}
            type={"error"}
            visible={!!errors["categoryId"]}
          />
        </ScrollView>
        <Card customStyles={styles.buttonContainer}>
          <View style={styles.button}>
            <Button.Text
              customStyles={{ textColor: theme.colors.error }}
              label={"Cancel"}
              onPress={onCancel}
            />
            <Spacer direction={"horizontal"} size={"large"} />
            <Button.Filled label={"Add"} onPress={onAdd} />
          </View>
        </Card>
      </Card>
    </>
  );
}

export default NewTransactionItemModal;
