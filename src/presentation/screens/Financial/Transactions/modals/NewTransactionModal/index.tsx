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
import { useMutation, useQuery } from "@infrastructure/fetcher";

import useForm from "./hooks/useForm";
import NewTransactionItemViewModel from "./models/NewTransactionViewModel";
import getStyles from "./styles";

function NewTransactionItemModal() {
  const { styles, theme } = getStyles();
  const owners = useQuery({
    cacheKey: [useCases.getOwnersUseCase.uniqueName],
    fetch: useCases.getOwnersUseCase.execute,
  });
  const { errors, fields, validateForm } = useForm();

  const addTransaction = useMutation({
    cacheKey: [useCases.createFinancialTransactionUseCase.uniqueName],
    fetch: useCases.createFinancialTransactionUseCase.execute,
  });

  const newTransactionItemModel = useMemo(
    () =>
      owners.data
        ? new NewTransactionItemViewModel({
            ownersDTO: owners.data,
          })
        : null,
    [owners.data],
  );

  useEffect(() => {
    if (addTransaction.status === "success") {
      router.back();
    }
  }, [addTransaction.status]);

  if (owners.isFetching || !newTransactionItemModel) {
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
          <View style={styles.lineContainer}>
            <View style={styles.helperTextContainer}>
              <TextInput.Outlined
                label={fields.category.label}
                onChangeText={fields.category.onChange}
                value={fields.category.value ?? ""}
              />
              <HelperText
                label={errors["category"]}
                type={"error"}
                visible={!!errors["category"]}
              />
            </View>
          </View>
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
