import { BlurView } from "expo-blur";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, View } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

import { useCases } from "@application/useCases";
import {
  Button,
  HelperText,
  Menu,
  Picker,
  Spacer,
  Text,
  TextInput,
} from "@components";
import Icon, { IconButton } from "@components/Icon";
import { useMutation, useQuery } from "@infrastructure/fetcher";
import useTranslation from "@presentation/i18n/useTranslation";
import {
  categoryColors,
  categoryDefaultSwatch,
  categoryRainbow,
} from "@presentation/theme/constants";
import useFinancialErrorFeedback from "@screens/Financial/hooks/useFinancialErrorFeedback";

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
  const { t } = useTranslation();

  const [iconMenuVisible, setIconMenuVisible] = useState(false);
  const [colorMenuVisible, setColorMenuVisible] = useState(false);

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

  useFinancialErrorFeedback(addCategory.error);

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
    <View style={styles.backdropContainer}>
      <Pressable onPress={onCancel} style={styles.backdrop} />
      <View style={styles.container}>
        <BlurView
          intensity={theme.dark ? 30 : 60}
          style={styles.blurView}
          tint={theme.dark ? "dark" : "light"}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.titleContainer}>
              <Text.Headline value={t("financial.categories.addNewCategory")} />
            </View>
            <Spacer direction={"vertical"} size={"md"} />

            <TextInput.Outlined
              label={t("financial.categories.name")}
              onChangeText={fields.name.onChange}
              value={fields.name.value}
            />
            <HelperText
              label={errors.name}
              type={"error"}
              visible={!!errors.name}
            />
            <Spacer direction={"vertical"} size={"md"} />

            <Picker
              items={[
                { label: t("financial.categories.expense"), value: "EXPENSE" },
                { label: t("financial.categories.income"), value: "INCOME" },
              ]}
              label={t("financial.categories.type")}
              onValueChange={(val) => {
                fields.type.onChange(val);
                fields.parentId.onChange("");
              }}
              selectedValue={fields.type.value}
            />
            <Spacer direction={"vertical"} size={"md"} />

            <Picker
              items={viewModel.stockOwners}
              label={t("financial.categories.owner")}
              onValueChange={(val) => {
                fields.ownerId.onChange(val);
                fields.parentId.onChange("");
              }}
              selectedValue={fields.ownerId.value ?? owners.data![0]?.id}
            />
            <Spacer direction={"vertical"} size={"md"} />

            <Picker
              items={viewModel.getParentCategories(
                fields.ownerId.value,
                fields.type.value,
              )}
              label={t("financial.categories.parent")}
              onValueChange={fields.parentId.onChange}
              selectedValue={fields.parentId.value ?? ""}
            />
            <Spacer direction={"vertical"} size={"md"} />

            <View style={styles.rowSelector}>
              {/* Color Selector */}
              <View style={styles.selectorItem}>
                <Text.Body bold value={t("financial.categories.color")} />
                <View style={styles.selectorTriggerWrapper}>
                  <Menu
                    anchor={
                      <Pressable
                        onPress={() => setColorMenuVisible(true)}
                        style={[
                          styles.colorPreviewButton,
                          fields.iconColor.value !== "black" && {
                            backgroundColor: fields.iconColor.value,
                          },
                        ]}
                      >
                        {fields.iconColor.value === "black" && (
                          <RainbowCircle />
                        )}
                      </Pressable>
                    }
                    onDismiss={() => setColorMenuVisible(false)}
                    visible={colorMenuVisible}
                  >
                    <View style={styles.colorMenuContent}>
                      {categoryColors.map((color) => (
                        <Pressable
                          key={color}
                          onPress={() => {
                            fields.iconColor.onChange(color);
                            setColorMenuVisible(false);
                          }}
                          style={[
                            styles.colorOptionCircle,
                            {
                              backgroundColor:
                                color === "black"
                                  ? categoryDefaultSwatch
                                  : color,
                            },
                          ]}
                        >
                          {fields.iconColor.value === color && (
                            <Icon color="white" name="check" size={16} />
                          )}
                        </Pressable>
                      ))}
                    </View>
                  </Menu>
                  <Text.Body
                    bold
                    color={theme.colors.textSecondary}
                    value=">"
                  />
                </View>
              </View>

              {/* Icon Selector */}
              <View style={styles.selectorItem}>
                <Text.Body bold value={t("financial.categories.chooseIcon")} />
                <View style={styles.selectorTriggerWrapper}>
                  <Menu
                    anchor={
                      <Pressable
                        onPress={() => setIconMenuVisible(true)}
                        style={styles.iconPreviewButton}
                      >
                        <Icon
                          color={fields.iconColor.value}
                          name={fields.icon.value}
                          size={28}
                        />
                      </Pressable>
                    }
                    onDismiss={() => setIconMenuVisible(false)}
                    visible={iconMenuVisible}
                  >
                    <ScrollView style={styles.iconMenuContent}>
                      <View style={styles.iconGridMenu}>
                        {AVAILABLE_ICONS.map((iconName) => {
                          const isSelected = fields.icon.value === iconName;
                          return (
                            <View
                              key={iconName}
                              style={[
                                styles.iconBoxMenu,
                                isSelected && {
                                  backgroundColor: theme.colors.accentSoft,
                                },
                              ]}
                            >
                              <IconButton
                                color={
                                  isSelected
                                    ? theme.colors.accent
                                    : theme.colors.textPrimary
                                }
                                name={iconName}
                                onPress={() => {
                                  fields.icon.onChange(iconName);
                                  setIconMenuVisible(false);
                                }}
                                size={theme.sizes.spacing.xl}
                              />
                            </View>
                          );
                        })}
                      </View>
                    </ScrollView>
                  </Menu>
                  <Text.Body
                    bold
                    color={theme.colors.textSecondary}
                    value=">"
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <View style={styles.button}>
              <Button.Text
                customStyles={{ textColor: theme.colors.expense }}
                label={t("financial.categories.cancel")}
                onPress={onCancel}
              />
              <Spacer direction={"horizontal"} size={"xl"} />
              <Button.Filled
                label={t("financial.categories.add")}
                onPress={onAdd}
              />
            </View>
          </View>
        </BlurView>
      </View>
    </View>
  );
}

function RainbowCircle() {
  return (
    <Svg height="48" viewBox="0 0 48 48" width="48">
      <Defs>
        <LinearGradient id="rainbow" x1="0%" x2="100%" y1="0%" y2="100%">
          {categoryRainbow.map((stopColor, index) => (
            <Stop
              key={stopColor}
              offset={`${(index * 100) / (categoryRainbow.length - 1)}%`}
              stopColor={stopColor}
            />
          ))}
        </LinearGradient>
      </Defs>
      <Circle cx="24" cy="24" fill="url(#rainbow)" r="22" />
    </Svg>
  );
}

export default NewCategoryModal;
