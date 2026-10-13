import { EmptyState, ErrorState, Screen, ScreenHeader } from "@components";
import { IconButton } from "@components/Icon";
import Skeleton from "@components/Skeleton";
import { useTranslation } from "@presentation/i18n";
import { useFamilyViewModel } from "@screens/Family/hooks";

import * as Containers from "./containers";

function Family() {
  const { t } = useTranslation();
  const vm = useFamilyViewModel();

  return (
    <Screen
      onRefresh={vm.onRefresh}
      refreshing={vm.refreshing}
      scroll
      testID="family-screen"
    >
      <ScreenHeader
        actions={
          <IconButton
            accessibilityLabel={t("family.list.newFamily")}
            name="plus"
            onPress={vm.onNewFamily}
            testID="family-new"
          />
        }
        subtitle={
          vm.status === "ready"
            ? t(vm.subtitleKey, { count: vm.count })
            : undefined
        }
        title={t("family.list.title")}
      />

      {vm.status === "loading" ? (
        <>
          <Skeleton.Card testID="family-skeleton-0" />
          <Skeleton.Card testID="family-skeleton-1" />
        </>
      ) : null}

      {vm.status === "error" ? (
        <ErrorState
          message={t("common.errors.generic")}
          onRetry={vm.onRetry}
          retryLabel={t("common.actions.tryAgain")}
          testID="family-error"
        />
      ) : null}

      {vm.status === "empty" ? (
        <EmptyState
          actionLabel={t("family.empty.action")}
          icon="account-group-outline"
          message={t("family.empty.message")}
          onAction={vm.onNewFamily}
          testID="family-empty"
          title={t("family.empty.title")}
        />
      ) : null}

      {vm.status === "ready"
        ? vm.families.map((family) => (
            <Containers.FamilyCard
              expanded={vm.isExpanded(family.familyId)}
              family={family}
              key={family.familyId}
              onToggle={() => vm.onToggle(family.familyId)}
            />
          ))
        : null}
    </Screen>
  );
}

export default Family;
