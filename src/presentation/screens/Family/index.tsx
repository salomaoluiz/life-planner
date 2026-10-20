import {
  EmptyState,
  ErrorState,
  Icon,
  ListItem,
  Screen,
  ScreenHeader,
} from "@components";
import { IconButton } from "@components/Icon";
import Skeleton from "@components/Skeleton";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import { useFamilyViewModel } from "@screens/Family/hooks";
import familyTestIds from "@screens/Family/testIds";

import * as Containers from "./containers";

function Family() {
  const { t } = useTranslation();
  const vm = useFamilyViewModel();
  const { sizes } = useKitTheme();

  return (
    <Screen
      onRefresh={vm.onRefresh}
      refreshing={vm.refreshing}
      scroll
      testID={familyTestIds.screen}
    >
      <ScreenHeader
        actions={
          <IconButton
            accessibilityLabel={t("family.list.newFamily")}
            name="plus"
            onPress={vm.onNewFamily}
            testID={familyTestIds.newButton}
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
          <Skeleton.Card testID={`${familyTestIds.skeleton}-0`} />
          <Skeleton.Card testID={`${familyTestIds.skeleton}-1`} />
        </>
      ) : null}

      {vm.status === "error" ? (
        <ErrorState
          message={t("common.errors.generic")}
          onRetry={vm.onRetry}
          retryLabel={t("common.actions.tryAgain")}
          testID={familyTestIds.errorState}
        />
      ) : null}

      {vm.status === "empty" ? (
        <EmptyState
          actionLabel={t("family.empty.action")}
          icon="account-group-outline"
          message={t("family.empty.message")}
          onAction={vm.onNewFamily}
          testID={familyTestIds.emptyState}
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

      {vm.status === "ready" && vm.archivedFamilies.length > 0 ? (
        <>
          <ListItem
            inset
            onPress={vm.onArchivedToggle}
            testID={familyTestIds.archivedToggle}
            title={t("family.archived.group", {
              count: vm.archivedFamilies.length,
            })}
            trailing={
              <Icon
                name={vm.archivedExpanded ? "chevron-up" : "chevron-down"}
                size={sizes.iconMd}
              />
            }
          />
          {vm.archivedExpanded
            ? vm.archivedFamilies.map((family) => (
                <Containers.FamilyCard
                  expanded={vm.isExpanded(family.familyId)}
                  family={family}
                  key={family.familyId}
                  onToggle={() => vm.onToggle(family.familyId)}
                />
              ))
            : null}
        </>
      ) : null}
    </Screen>
  );
}

export default Family;
