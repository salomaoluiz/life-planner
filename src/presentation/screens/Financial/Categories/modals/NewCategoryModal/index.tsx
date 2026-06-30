import { router } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { useCases } from "@application/useCases";
import {
  Button,
  Card,
  HelperText,
  Picker,
  Spacer,
  Text,
  TextInput,
} from "@components";
import { IconButton } from "@components/Icon";
import { useMutation, useQuery } from "@infrastructure/fetcher";

import useForm from "./hooks/useForm";
import NewCategoryViewModel from "./models/NewCategoryViewModel";
import getStyles from "./styles";

const AVAILABLE_ICONS = [
  "folder",
  "food",
  "car",
  "home",
  "medical-bag",
  "school",
  "airplane",
  "gift",
  "cart",
  "bank",
  "cash",
  "credit-card",
  "water",
  "lightning-bolt",
  "wifi",
  "controller",
  "dumbbell",
  "heart",
];

function NewCategoryModal() {
  const { styles, theme } = getStyles();

  const owners = useQuery({
    cacheKey: [useCases.getOwnersUseCase.uniqueName],
    fetch: useCases.getOwnersUseCase.execute,
  });

  const categories = useQuery({
    cacheKey: [useCases.getFinancialCategoriesUseCase.uniqueName],
    enabled: !!owners.data,
    fetch: async () => {
      if (!owners.data) return [];
      const ownerIds = owners.data.map((o) => o.id);
      return useCases.getFinancialCategoriesUseCase.execute(ownerIds);
    },
  });

  const { errors, fields, validateForm } = useForm();

  const addCategory = useMutation({
    cacheKey: [useCases.createFinancialCategoryUseCase.uniqueName],
    fetch: useCases.createFinancialCategoryUseCase.execute,
  });

  const viewModel = useMemo(() => {
    return owners.data && categories.data
      ? new NewCategoryViewModel(owners.data, categories.data)
      : null;
  }, [owners.data, categories.data]);

  useEffect(() => {
    if (addCategory.status === "success") {
      router.back();
    }
  }, [addCategory.status]);

  if (owners.isFetching || categories.isFetching || !viewModel) {
    return (
      <View style={styles.loadingContainer}>
        <Text.Headline value={"Loading..."} />
      </View>
    );
  }

  function onCancel() {
    router.back();
  }

  function onAdd() {
    const params = validateForm(owners.data!, categories.data ?? []);
    if (params) {
      addCategory.mutate(params);
    }
  }

  return (
    <>
      <Pressable onPress={onCancel} style={styles.backdrop} />
      <Card customStyles={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.titleContainer}>
            <Text.Headline value={"Add New Category"} />
          </View>
          <Spacer direction={"vertical"} size={"medium"} />

          <TextInput.Outlined
            label={fields.name.label}
            onChangeText={fields.name.onChange}
            value={fields.name.value}
          />
          <HelperText
            label={errors.name}
            type={"error"}
            visible={!!errors.name}
          />
          <Spacer direction={"vertical"} size={"medium"} />

          <Picker
            items={viewModel.stockOwners}
            label={fields.ownerId.label}
            onValueChange={(val) => {
              fields.ownerId.onChange(val);
              fields.parentId.onChange("");
            }}
            selectedValue={fields.ownerId.value ?? owners.data![0]?.id}
          />
          <Spacer direction={"vertical"} size={"medium"} />

          <Picker
            items={viewModel.getParentCategories(fields.ownerId.value)}
            label={fields.parentId.label}
            onValueChange={fields.parentId.onChange}
            selectedValue={fields.parentId.value ?? ""}
          />
          <Spacer direction={"vertical"} size={"medium"} />

          <Text.Body bold value="Choose Icon" />
          <Spacer direction={"vertical"} size={"small"} />
          <View style={styles.iconGrid}>
            {AVAILABLE_ICONS.map((iconName) => {
              const isSelected = fields.icon.value === iconName;
              return (
                <View
                  key={iconName}
                  style={[
                    styles.iconBox,
                    isSelected && {
                      backgroundColor: theme.colors.primaryContainer,
                    },
                  ]}
                >
                  <IconButton
                    color={
                      isSelected ? theme.colors.primary : theme.colors.onSurface
                    }
                    name={iconName}
                    onPress={() => fields.icon.onChange(iconName)}
                    size={theme.sizes.spacing.large}
                  />
                </View>
              );
            })}
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

export default NewCategoryModal;
