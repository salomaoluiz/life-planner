import { Text } from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import { CurrencyCode } from "@domain/entities/financial/Currency";
import { useLocaleTag, useTranslation } from "@presentation/i18n";

interface Props {
  cents: number;
  currency: CurrencyCode;
  testID?: string;
}

function ProjectedBalance(props: Props) {
  const { t } = useTranslation();
  const localeTag = useLocaleTag();

  return (
    <Text.Caption
      testID={props.testID}
      tone={"secondary"}
      value={t("financial.accounts.projectedBalance", {
        value: formatAmount(props.cents, localeTag, props.currency),
      })}
    />
  );
}

export default ProjectedBalance;
