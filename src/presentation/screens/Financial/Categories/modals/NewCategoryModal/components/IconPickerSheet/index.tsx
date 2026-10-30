import { View } from "react-native";

import {
  BottomSheet,
  Chip,
  EmptyState,
  ErrorState,
  IconTileButton,
  SearchField,
  Text,
} from "@components";
import Skeleton from "@components/Skeleton";
import { IconSearchStatus } from "@screens/Financial/Categories/modals/NewCategoryModal/hooks/useIconSearch";
import categoryFormTestIds from "@screens/Financial/Categories/modals/NewCategoryModal/testIds";

import useStyles from "./styles";

interface IconOption {
  label: string;
  value: string;
}

interface Props {
  clearLabel: string;
  closeLabel: string;
  emptyHint: string;
  emptyTitle: string;
  errorHint: string;
  errorTitle: string;
  groups: { icons: IconOption[]; title: string }[];
  onClose: () => void;
  onQueryChange: (text: string) => void;
  onRetry: () => void;
  onSelect: (value: string) => void;
  query: string;
  resultLine: string;
  results: IconOption[];
  retryLabel: string;
  samples: string[];
  samplesLabel: string;
  searchPlaceholder: string;
  selected: string;
  status: IconSearchStatus;
  title: string;
  /** Web / tablet: a wide dialog with more columns and the sample chips. */
  wide: boolean;
}

const SKELETON_TILES = [0, 1, 2, 3];
const RESULT_COLUMNS = { compact: 4, wide: 6 };
const GROUP_COLUMNS = { compact: 4, wide: 10 };

function IconPickerSheet(props: Props) {
  const { cell, styles } = useStyles();
  const resultColumns = props.wide
    ? RESULT_COLUMNS.wide
    : RESULT_COLUMNS.compact;
  const groupColumns = props.wide ? GROUP_COLUMNS.wide : GROUP_COLUMNS.compact;
  const searching = props.query.trim().length > 0;

  function renderBody() {
    if (props.status === "loading") {
      return (
        <View style={styles.grid}>
          {SKELETON_TILES.map((tile) => (
            <View key={tile} style={cell(resultColumns)}>
              <Skeleton.Box height={76} width={"100%"} />
            </View>
          ))}
        </View>
      );
    }
    if (props.status === "error") {
      return (
        <ErrorState
          message={props.errorHint}
          onRetry={props.onRetry}
          retryLabel={props.retryLabel}
          testID={categoryFormTestIds.iconPickerRetry}
          title={props.errorTitle}
        />
      );
    }
    if (props.status === "empty") {
      return (
        <EmptyState
          icon={"magnify-close"}
          message={props.emptyHint}
          testID={categoryFormTestIds.iconPickerEmpty}
          title={props.emptyTitle}
        />
      );
    }
    if (!searching) {
      return (
        <View style={styles.body}>
          {props.groups.map((group) => (
            <View key={group.title} style={styles.group}>
              <Text.Caption tone={"secondary"} value={group.title} />
              <View style={styles.grid}>
                {group.icons.map((icon) => (
                  <View key={icon.value} style={cell(groupColumns)}>
                    <IconTileButton
                      icon={icon.value}
                      label={icon.label}
                      onPress={() => props.onSelect(icon.value)}
                      selected={icon.value === props.selected}
                      testID={`${categoryFormTestIds.iconPickerResult}-${icon.value}`}
                      variant={"plain"}
                    />
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      );
    }

    return (
      <View style={styles.body}>
        <Text.Caption tone={"secondary"} value={props.resultLine} />
        <View style={styles.grid}>
          {props.results.map((icon, index) => (
            <View key={icon.value} style={cell(resultColumns)}>
              <IconTileButton
                highlighted={index === 0}
                icon={icon.value}
                label={icon.label}
                onPress={() => props.onSelect(icon.value)}
                selected={icon.value === props.selected}
                testID={`${categoryFormTestIds.iconPickerResult}-${icon.value}`}
              />
            </View>
          ))}
        </View>
      </View>
    );
  }

  return (
    <BottomSheet
      closeLabel={props.closeLabel}
      onClose={props.onClose}
      size={props.wide ? "form" : undefined}
      title={props.title}
      visible
    >
      <View style={styles.body}>
        <SearchField
          autoFocus={props.wide}
          clearLabel={props.clearLabel}
          onChangeText={props.onQueryChange}
          placeholder={props.searchPlaceholder}
          testID={categoryFormTestIds.iconPickerSearch}
          value={props.query}
        />
        {props.wide && (
          <View style={styles.samples}>
            <Text.Caption tone={"secondary"} value={props.samplesLabel} />
            {props.samples.map((sample) => (
              <Chip
                key={sample}
                label={sample}
                onPress={() => props.onQueryChange(sample)}
              />
            ))}
            {searching && (
              <Chip
                label={props.clearLabel}
                onPress={() => props.onQueryChange("")}
              />
            )}
          </View>
        )}
        {renderBody()}
      </View>
    </BottomSheet>
  );
}

export type { IconOption };
export default IconPickerSheet;
