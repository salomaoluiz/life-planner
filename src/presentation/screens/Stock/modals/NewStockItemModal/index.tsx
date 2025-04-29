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
import NewStockItemViewModel from "@screens/Stock/modals/NewStockItemModal/models/NewStockItemViewModel";

import useForm from "./hooks/useForm";
import getStyles from "./styles";

function NewStockItemModal() {
  const { styles, theme } = getStyles();
  const owners = useQuery({
    cacheKey: [useCases.getOwnersUseCase.uniqueName],
    fetch: useCases.getOwnersUseCase.execute,
  });
  const { errors, fields, validateForm } = useForm();

  const addStock = useMutation({
    cacheKey: [useCases.createStockItemUseCase.uniqueName],
    fetch: useCases.createStockItemUseCase.execute,
  });

  const newStockItemModel = useMemo(
    () =>
      owners.data
        ? new NewStockItemViewModel({
            stockOwnersDTO: owners.data,
          })
        : null,
    [owners.data],
  );

  useEffect(() => {
    if (addStock.status === "success") {
      router.back();
    }
  }, [addStock.status]);

  if (owners.isFetching || !newStockItemModel) {
    return (
      <View>
        <Text.Headline value={"Loading"} />
      </View>
    );
  }

  function onCancel() {
    router.back();
  }

  function onAdd() {
    const params = validateForm(owners.data!);

    if (params) {
      addStock.mutate(params);
    }
  }

  return (
    <>
      <Pressable onPress={onCancel} style={styles.backdrop} />
      <Card customStyles={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.titleContainer}>
            <Text.Headline value={"Add a new item to stock"} />
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
                label={fields.quantity.label}
                onChangeText={fields.quantity.onChange}
                value={fields.quantity.value}
              />
              <HelperText
                label={errors["quantity"]}
                type={"error"}
                visible={!!errors["quantity"]}
              />
            </View>
            <Spacer direction={"horizontal"} size={"medium"} />
            <View style={styles.helperTextContainer}>
              <Picker
                items={newStockItemModel.stockUnits}
                onValueChange={fields.unit.onChange}
                selectedValue={fields.unit.value}
              />
              <HelperText
                label={errors["unit"]}
                type={"error"}
                visible={!!errors["unit"]}
              />
            </View>
          </View>
          <Spacer direction={"vertical"} size={"medium"} />
          <Picker
            items={newStockItemModel.stockOwners}
            label={fields.owner.label}
            onValueChange={(value) => {
              fields.ownerId.onChange(value);
              fields.owner.onChange(newStockItemModel.stockOwnerType(value!));
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
                date={fields.openingDate.value}
                label={fields.openingDate.label}
                mode={"single"}
                onConfirm={({ date }) => {
                  fields.openingDate.onChange(date);
                }}
              />
              <HelperText
                label={errors["openingDate"]}
                type={"error"}
                visible={!!errors["openingDate"]}
              />
            </View>
          </View>
          <Spacer direction={"vertical"} size={"medium"} />
          <View style={styles.lineContainer}>
            <View style={styles.helperTextContainer}>
              <DatePicker
                date={fields.expirationDate.value}
                label={fields.expirationDate.label}
                mode={"single"}
                onConfirm={({ date }) => {
                  fields.expirationDate.onChange(date);
                }}
              />
              <HelperText
                label={errors["expirationDate"]}
                type={"error"}
                visible={!!errors["expirationDate"]}
              />
            </View>
            <Spacer direction={"horizontal"} size={"medium"} />
            <View style={styles.helperTextContainer}>
              <DatePicker
                date={fields.purchaseDate.value}
                label={fields.purchaseDate.label}
                mode={"single"}
                onConfirm={({ date }) => {
                  fields.purchaseDate.onChange(date);
                }}
              />
              <HelperText
                label={errors["purchaseDate"]}
                type={"error"}
                visible={!!errors["purchaseDate"]}
              />
            </View>
          </View>
          <Spacer direction={"vertical"} size={"medium"} />
          <View style={styles.lineContainer}>
            <View style={styles.helperTextContainer}>
              <TextInput.Outlined
                label={fields.barcode.label}
                onChangeText={fields.barcode.onChange}
                value={fields.barcode.value ?? ""}
              />
              <HelperText
                label={errors["barcode"]}
                type={"error"}
                visible={!!errors["barcode"]}
              />
            </View>
            <Spacer direction={"horizontal"} size={"medium"} />
            <View style={styles.helperTextContainer}>
              <TextInput.Outlined
                label={fields.brand.label}
                onChangeText={fields.brand.onChange}
                value={fields.brand.value ?? ""}
              />
              <HelperText
                label={errors["brand"]}
                type={"error"}
                visible={!!errors["brand"]}
              />
            </View>
          </View>
          <Spacer direction={"vertical"} size={"medium"} />
          <View style={styles.fullLineContainer}>
            <View style={styles.helperTextContainer}>
              <TextInput.Outlined
                label={fields.notes.label}
                multiline
                onChangeText={fields.notes.onChange}
                value={fields.notes.value ?? ""}
              />
              <HelperText
                label={errors["notes"]}
                type={"error"}
                visible={!!errors["notes"]}
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

export default NewStockItemModal;
