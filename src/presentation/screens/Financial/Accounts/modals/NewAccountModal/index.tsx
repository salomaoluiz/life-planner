import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";

import { useCases } from "@application/useCases";
import { CreateAccountUseCaseParams } from "@application/useCases/cases/financial/accounts/createAccountUseCase";
import { UpdateAccountUseCaseParams } from "@application/useCases/cases/financial/accounts/updateAccountUseCase";
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
import useTranslation from "@presentation/i18n/useTranslation";
import useFinancialErrorFeedback from "@screens/Financial/hooks/useFinancialErrorFeedback";

import useForm from "./hooks/useForm";
import NewAccountViewModel from "./models/NewAccountViewModel";
import getStyles from "./styles";

const AVAILABLE_ICONS = [
  "bank",
  "cash",
  "credit-card",
  "wallet",
  "folder",
  "food",
  "car",
  "home",
  "gift",
  "cart",
];

function NewAccountModal() {
  const { styles, theme } = getStyles();
  const { t } = useTranslation();
  const params = useLocalSearchParams<{
    balance?: string;
    icon?: string;
    id?: string;
    name?: string;
    ownerId?: string;
    status?: string;
  }>();

  const isEditing = !!params.id;

  const owners = useQuery({
    cacheKey: [useCases.getOwnersUseCase.uniqueName],
    fetch: useCases.getOwnersUseCase.execute,
  });

  const { errors, fields, validateForm } = useForm({
    initialValues: {
      balance: params.balance,
      icon: params.icon,
      id: params.id,
      name: params.name,
      ownerId: params.ownerId,
      status: params.status,
    },
  });

  const saveMutation = useMutation({
    cacheKey: [
      isEditing
        ? useCases.updateFinancialAccountUseCase.uniqueName
        : useCases.createFinancialAccountUseCase.uniqueName,
    ],
    fetch: async (
      payload: CreateAccountUseCaseParams & UpdateAccountUseCaseParams,
    ) => {
      if (isEditing) {
        await useCases.updateFinancialAccountUseCase.execute(payload);
      } else {
        await useCases.createFinancialAccountUseCase.execute(payload);
      }
    },
  });

  useFinancialErrorFeedback(saveMutation.error);

  const viewModel = useMemo(() => {
    return owners.data ? new NewAccountViewModel(owners.data) : null;
  }, [owners.data]);

  useEffect(() => {
    if (saveMutation.status === "success") {
      router.back();
    }
  }, [saveMutation.status]);

  if (owners.isFetching || !viewModel) {
    return (
      <View style={styles.loadingContainer}>
        <Text.Headline value={t("financial.accounts.loading")} />
      </View>
    );
  }

  function onCancel() {
    router.back();
  }

  function onSave() {
    const validated = validateForm(owners.data!);
    if (validated) {
      // Cast the validated values to match both Create and Update params
      saveMutation.mutate(
        validated as CreateAccountUseCaseParams & UpdateAccountUseCaseParams,
      );
    }
  }

  return (
    <>
      <Pressable onPress={onCancel} style={styles.backdrop} />
      <Card customStyles={styles.container}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.titleContainer}>
            <Text.Headline
              value={
                isEditing
                  ? t("financial.accounts.editAccount")
                  : t("financial.accounts.addNewAccount")
              }
            />
          </View>
          <Spacer direction={"vertical"} size={"md"} />

          <TextInput.Outlined
            label={t("financial.accounts.name")}
            onChangeText={fields.name.onChange}
            value={fields.name.value}
          />
          <HelperText
            label={errors.name}
            type={"error"}
            visible={!!errors.name}
          />
          <Spacer direction={"vertical"} size={"md"} />

          <TextInput.Outlined
            keyboardType={"numeric"}
            label={t("financial.accounts.balance")}
            onChangeText={fields.balance.onChange}
            value={fields.balance.value}
          />
          <HelperText
            label={errors.balance}
            type={"error"}
            visible={!!errors.balance}
          />
          <Spacer direction={"vertical"} size={"md"} />

          <Picker
            items={viewModel.accountOwners}
            label={t("financial.accounts.owner")}
            onValueChange={fields.ownerId.onChange}
            selectedValue={fields.ownerId.value ?? owners.data![0]?.id}
          />
          <Spacer direction={"vertical"} size={"md"} />

          <Picker
            items={viewModel.accountStatuses}
            label={t("financial.accounts.status")}
            onValueChange={fields.status.onChange}
            selectedValue={fields.status.value}
          />
          <Spacer direction={"vertical"} size={"md"} />

          <Text.Body bold value={t("financial.accounts.chooseIcon")} />
          <Spacer direction={"vertical"} size={"sm"} />
          <View style={styles.iconGrid}>
            {AVAILABLE_ICONS.map((iconName) => {
              const isSelected = fields.icon.value === iconName;
              return (
                <View
                  key={iconName}
                  style={[
                    styles.iconBox,
                    isSelected && {
                      backgroundColor: theme.colors.accentSoft,
                    },
                  ]}
                >
                  <IconButton
                    accessibilityLabel={iconName}
                    color={
                      isSelected
                        ? theme.colors.accent
                        : theme.colors.textPrimary
                    }
                    name={iconName}
                    onPress={() => fields.icon.onChange(iconName)}
                    size={theme.sizes.spacing.xl}
                  />
                </View>
              );
            })}
          </View>
        </ScrollView>

        <Card customStyles={styles.buttonContainer}>
          <View style={styles.button}>
            <Button.Text
              customStyles={{ textColor: theme.colors.expense }}
              label={t("financial.accounts.cancel")}
              onPress={onCancel}
            />
            <Spacer direction={"horizontal"} size={"xl"} />
            <Button.Filled
              label={
                isEditing
                  ? t("financial.accounts.save")
                  : t("financial.accounts.add")
              }
              onPress={onSave}
            />
          </View>
        </Card>
      </Card>
    </>
  );
}

export default NewAccountModal;
