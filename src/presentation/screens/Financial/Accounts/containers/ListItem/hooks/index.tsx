import { router } from "expo-router";
import { useEffect } from "react";
import { Alert } from "react-native";

import { useCases } from "@application/useCases";
import { useMutation } from "@infrastructure/fetcher";
import useTranslation from "@presentation/i18n/useTranslation";

import FinancialAccountViewModel from "../../../models/FinancialAccountViewModel";

export interface Props {
  item: FinancialAccountViewModel;
  refetch: () => void;
}

function useListItem(props: Props) {
  const { t } = useTranslation();
  const deleteItem = useMutation({
    cacheKey: [useCases.deleteFinancialAccountUseCase.uniqueName],
    fetch: useCases.deleteFinancialAccountUseCase.execute,
  });

  useEffect(() => {
    if (deleteItem.status === "success") {
      props.refetch();
    }
  }, [deleteItem.status]);

  function onDelete() {
    Alert.alert(
      t("financial.accounts.deleteAlertTitle"),
      t("financial.accounts.deleteAlertMsg"),
      [
        {
          style: "cancel",
          text: t("financial.accounts.cancel"),
        },
        {
          onPress: () => {
            deleteItem.mutate({
              id: props.item.id,
              ownerId: props.item.ownerId,
            });
          },
          style: "destructive",
          text: t("financial.accounts.deleteBtn"),
        },
      ],
    );
  }

  function onEdit() {
    router.push({
      params: {
        balance: props.item.balance.toString(),
        icon: props.item.icon,
        id: props.item.id,
        name: props.item.name,
        ownerId: props.item.ownerId,
        status: props.item.status,
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pathname: "/financial/account/add_new_account" as any,
    });
  }

  return { onDelete, onEdit };
}

export default useListItem;
