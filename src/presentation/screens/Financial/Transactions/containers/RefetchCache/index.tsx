import { useEffect } from "react";

import { useCases } from "@application/useCases";
import { IconButton } from "@components/Icon";
import { useMutation } from "@infrastructure/fetcher";
import { useTheme } from "@presentation/theme";

interface Props {
  refetchQuery: () => void;
}

function RefetchCache(props: Props) {
  const { theme } = useTheme();

  const { mutate, status } = useMutation<void, void>({
    cacheKey: [useCases.invalidateCacheFinancialTransactionsUseCase.uniqueName],
    fetch: useCases.invalidateCacheFinancialTransactionsUseCase.execute,
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
      name={"refresh"}
      onPress={onRefresh}
      size={theme.sizes.spacing.large}
    />
  );
}

export default RefetchCache;
