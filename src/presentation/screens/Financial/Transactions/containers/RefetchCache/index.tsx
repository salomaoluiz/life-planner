import { useEffect } from "react";

import { useCases } from "@application/useCases";
import { IconButton } from "@components/Icon";
import { useMutation } from "@infrastructure/fetcher";
import { useTranslation } from "@presentation/i18n";
import { useTheme } from "@presentation/theme";

interface Props {
  refetchQuery: () => void;
}

function RefetchCache(props: Props) {
  const { t } = useTranslation();
  const { theme } = useTheme();

  const { mutate, status } = useMutation<void, void>({
    cacheKey: [useCases.refreshFinancialTransactionsUseCase.uniqueName],
    fetch: useCases.refreshFinancialTransactionsUseCase.execute,
  });

  useEffect(() => {
    if (status === "success") {
      props.refetchQuery();
    }
  }, [status]);

  function onRefresh() {
    mutate();
  }

  return (
    <IconButton
      accessibilityLabel={t("common.actions.tryAgain")}
      name={"refresh"}
      onPress={onRefresh}
      size={theme.sizes.spacing.xl}
    />
  );
}

export default RefetchCache;
