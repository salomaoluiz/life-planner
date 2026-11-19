import { memo } from "react";
import { View } from "react-native";

import {
  AmountText,
  Badge,
  Button,
  Card,
  ColorDot,
  Icon,
  IconTile,
  Text,
  Touchable,
} from "@components";
import { formatAmount } from "@components/AmountText/formatAmount";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useLocaleTag, useTranslation } from "@presentation/i18n";
import SplitUIModel from "@screens/Financial/Transactions/models/SplitUIModel";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

import useStyles from "./styles";

interface Props {
  expanded: boolean;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onToggle: (id: string) => void;
  split: SplitUIModel;
}

// Spec 119 FR 39-40: one split as ONE line of the day list, like a card invoice: a chip "Dividida · N partes", the net
// amount and a chevron. Tap expands the parts; with a filter the line shows the matching share and "de R$ total".
function SplitRow(props: Props) {
  const { styles } = useStyles();
  const { colors } = useKitTheme();
  // The neutral colour of a part with no category (the adjustment) and of the "other parts" line.
  const NEUTRAL = colors.textSecondary;
  const { t } = useTranslation();
  const localeTag = useLocaleTag();
  const { expanded, split } = props;
  const currency = split.currency;
  const shownCents = split.isFiltered
    ? Math.abs(split.signedCents)
    : split.totalCents;
  const subtitle = split.isFiltered
    ? t("financial.split.matched", {
        count: split.partCount,
        matched: split.matchedCount,
      })
    : split.accountName;

  return (
    <Card padding="sm" testID={transactionsTestIds.splitRow}>
      <Touchable
        accessibilityLabel={split.description}
        accessibilityRole="button"
        onPress={() => props.onToggle(split.id)}
        testID={transactionsTestIds.splitToggle}
      >
        <View style={styles.header}>
          <IconTile name="call-split" />
          <View style={styles.headerText}>
            <Text.BodyStrong
              numberOfLines={1}
              testID={transactionsTestIds.splitTitle}
              value={split.description}
            />
            <View style={styles.badges}>
              <Badge
                label={t("financial.split.chip", { count: split.partCount })}
                testID={transactionsTestIds.splitChip}
                tone="accent"
              />
              {subtitle ? (
                <Text.Caption
                  testID={transactionsTestIds.splitSubtitle}
                  tone="secondary"
                  value={subtitle}
                />
              ) : null}
            </View>
          </View>
          <View style={styles.amount}>
            <AmountText
              currency={currency}
              testID={transactionsTestIds.splitAmount}
              type={split.isExpense ? "EXPENSE" : "INCOME"}
              value={shownCents}
            />
            {split.isFiltered ? (
              <Text.Caption
                testID={transactionsTestIds.splitOfTotal}
                tone="secondary"
                value={t("financial.split.ofTotal", {
                  total: formatAmount(split.totalCents, localeTag, currency),
                })}
              />
            ) : null}
          </View>
          <Icon name={expanded ? "chevron-up" : "chevron-down"} size={20} />
        </View>
      </Touchable>
      {expanded ? (
        <View>
          <View style={styles.parts}>
            {split.partViews.map((part) => (
              <Touchable
                accessibilityLabel={part.categoryName}
                accessibilityRole="button"
                key={part.id}
                onPress={() => props.onEdit(split.id)}
                testID={transactionsTestIds.splitPart}
              >
                <View style={styles.part}>
                  <ColorDot color={part.categoryColor ?? NEUTRAL} />
                  <View style={styles.partText}>
                    <Text.Body
                      numberOfLines={1}
                      value={
                        part.isAdjustment
                          ? t("financial.split.adjustment")
                          : part.categoryName
                      }
                    />
                    {part.description && !part.isAdjustment ? (
                      <Text.Caption
                        numberOfLines={1}
                        tone={part.inherited ? "secondary" : undefined}
                        value={part.description}
                      />
                    ) : null}
                    {part.tags.length > 0 ? (
                      <View style={styles.tags}>
                        {part.tags.map((tag) => (
                          <Badge key={tag} label={`#${tag}`} tone="neutral" />
                        ))}
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.partAmount}>
                    <Text.BodyStrong
                      tone={part.amountCents < 0 ? "income" : undefined}
                      value={`${part.amountCents < 0 ? "− " : ""}${formatAmount(
                        Math.abs(part.amountCents),
                        localeTag,
                        currency,
                      )}`}
                    />
                  </View>
                </View>
              </Touchable>
            ))}
            {split.othersCount > 0 ? (
              <View style={styles.part}>
                <ColorDot color={NEUTRAL} />
                <View style={styles.partText}>
                  <Text.Caption
                    testID={transactionsTestIds.splitOthers}
                    tone="secondary"
                    value={t("financial.split.others", {
                      count: split.othersCount,
                    })}
                  />
                </View>
                <Text.Caption
                  tone="secondary"
                  value={formatAmount(split.othersCents, localeTag, currency)}
                />
              </View>
            ) : null}
          </View>
          <View style={styles.actions}>
            <Button.Secondary
              label={t("financial.split.deleteGroup")}
              onPress={() => props.onDelete(split.id)}
              testID={transactionsTestIds.splitDelete}
              tone="expense"
            />
            <Button.Secondary
              label={t("financial.split.edit")}
              onPress={() => props.onEdit(split.id)}
              testID={transactionsTestIds.splitEdit}
            />
          </View>
        </View>
      ) : null}
    </Card>
  );
}

export default memo(SplitRow);
