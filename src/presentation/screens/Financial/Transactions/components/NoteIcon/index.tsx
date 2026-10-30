import { View } from "react-native";

import { Icon, Text, Tooltip } from "@components";
import { useKitTheme } from "@components/utils/useKitTheme";
import { useTranslation } from "@presentation/i18n";
import transactionsTestIds from "@screens/Financial/Transactions/testIds";

interface Props {
  note: string;
}

// Spec 059 FR 10-12: a small icon on rows with a note; on web hovering (or focusing) it shows the note in at most 2 lines.
function NoteIcon(props: Props) {
  const { t } = useTranslation();
  const { colors } = useKitTheme();

  return (
    <Tooltip
      content={<Text.Caption numberOfLines={2} value={props.note} />}
      testID={transactionsTestIds.rowNoteTooltip}
    >
      <View
        accessibilityLabel={t("financial.transactions.hasNote")}
        accessibilityRole="image"
        accessible
        focusable
      >
        <Icon
          color={colors.textSecondary}
          name={"note-text-outline"}
          size={16}
          testID={transactionsTestIds.rowNoteIcon}
        />
      </View>
    </Tooltip>
  );
}

export default NoteIcon;
