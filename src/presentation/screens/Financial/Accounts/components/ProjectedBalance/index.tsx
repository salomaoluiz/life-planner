import { Text } from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import { useLocaleTag, useTranslation } from "@presentation/i18n";

interface Props {
  cents: number;
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
        value: formatAmount(props.cents, localeTag),
      })}
    />
  );
}

export default ProjectedBalance;
