import { ReactNode, useEffect, useRef, useState } from "react";
import {
  NativeSyntheticEvent,
  TextInput,
  TextInputKeyPressEventData,
  View,
} from "react-native";

import FieldShell from "@components/FieldShell";
import FocusRing from "@components/FocusRing";
import Icon from "@components/Icon";
import Text from "@components/Text";
import Touchable from "@components/Touchable";

import useStyles from "./styles";

export type AutocompleteFieldProps = ChipsProps | TextProps;

export interface AutocompleteSuggestion {
  id: string;
  label: string;
  /** Before the label, e.g. a category tile */
  leading?: ReactNode;
  /** The part of `label` shown in bold, as [start, end) indexes (the typed text) */
  matchRange?: [number, number];
  /** Shown at the end of the row, e.g. a usage count */
  meta?: string;
  /** After everything else, e.g. a type bullet */
  trailing?: ReactNode;
}

interface BaseProps {
  disabled?: boolean;
  error?: string;
  helper?: string;
  label: string;
  /** Up to this many suggestions are listed (default 8) */
  maxSuggestions?: number;
  onQueryChange?: (query: string) => void;
  placeholder?: string;
  /** The suggestions are already filtered by the caller: only the limit applies */
  prefiltered?: boolean;
  /** Announced politely when the list changes, e.g. "3 suggestions" */
  resultsLabel?: (count: number) => string;
  suggestions: AutocompleteSuggestion[];
  testID?: string;
}

/** Several values as chips; Enter picks the highlighted option or creates one. */
interface ChipsProps extends BaseProps {
  allowCreate?: boolean;
  createLabel?: (query: string) => string;
  /** Shown instead of the helper once `maxValues` is reached */
  maxLabel?: string;
  maxLength?: number;
  maxValues?: number;
  mode: "chips";
  onChange: (values: string[]) => void;
  removeLabel: (label: string) => string;
  /** Shown as the error while the typed text is longer than `maxLength` */
  tooLongLabel?: string;
  values: string[];
}

interface Option {
  create: boolean;
  id: string;
  // What the row shows
  label: string;
  leading?: ReactNode;
  matchRange?: [number, number];
  meta?: string;
  trailing?: ReactNode;
  // What picking it adds or fills in
  value: string;
}

/** A free text; picking a suggestion fills it in. */
interface TextProps extends BaseProps {
  maxLength?: number;
  mode: "text";
  onChangeText: (text: string) => void;
  onSelect?: (suggestion: AutocompleteSuggestion) => void;
  value: string;
}

// The list stays open a moment after the blur, so a tap on an option still lands.
const BLUR_CLOSE_DELAY = 150;

function addValue(values: string[], label: string) {
  const name = label.trim();

  return values.some((value) => sameText(value, name))
    ? values
    : [...values, name];
}

function AutocompleteField(props: AutocompleteFieldProps) {
  const [focused, setFocused] = useState(false);
  const [query, setQuery] = useState("");
  const [highlight, setHighlight] = useState(-1);
  const closeTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  // A press that started inside the list: the blur it causes must not close the list before the tap lands.
  const pressingMenu = useRef(false);
  const { styles, theme } = useStyles();
  const { testID } = props;
  const isChips = props.mode === "chips";
  const text = isChips ? query : props.value;
  const values = isChips ? props.values : [];
  const atMax =
    isChips && props.maxValues !== undefined
      ? values.length >= props.maxValues
      : false;
  const tooLong =
    isChips && props.maxLength !== undefined && query.length > props.maxLength;
  const options = buildOptions(props, text, values, tooLong);
  const open = focused && !atMax && options.length > 0;
  const activeIndex = Math.min(highlight, options.length - 1);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  function changeText(next: string) {
    setHighlight(-1);

    if (props.mode === "text") {
      props.onChangeText(next);
    } else {
      setQuery(next);
    }

    props.onQueryChange?.(next);
  }

  function pick(option: Option) {
    pressingMenu.current = false;
    setHighlight(-1);

    if (props.mode === "text") {
      const suggestion = props.suggestions.find(
        (item) => item.id === option.id,
      );

      if (suggestion) {
        // A tap on an option keeps the input focused: close the list by hand.
        clearTimeout(closeTimer.current);
        setFocused(false);
        // The text first: an `onSelect` that sets the whole form afterwards has the last word.
        props.onChangeText(option.value);
        props.onSelect?.(suggestion);
      }
    } else {
      props.onChange(addValue(values, option.value));
      setQuery("");
      props.onQueryChange?.("");
    }
  }

  function submit() {
    const chosen = options[Math.max(activeIndex, 0)];

    if (chosen && (activeIndex >= 0 || isChips)) {
      pick(chosen);
    }
  }

  function removeLast() {
    if (props.mode === "chips" && query.length === 0 && values.length > 0) {
      props.onChange(values.slice(0, -1));
    }
  }

  function keyPress(event: NativeSyntheticEvent<TextInputKeyPressEventData>) {
    switch (event.nativeEvent.key) {
      case "ArrowDown":
        setHighlight((current) => (current + 1) % Math.max(options.length, 1));
        break;
      case "ArrowUp":
        setHighlight((current) =>
          current <= 0 ? options.length - 1 : current - 1,
        );
        break;
      case "Backspace":
        removeLast();
        break;
      case "Escape":
        setFocused(false);
        break;
    }
  }

  const errorText =
    props.error ?? (tooLong && isChips ? props.tooLongLabel : undefined);
  const helperText =
    atMax && isChips && props.maxLabel ? props.maxLabel : props.helper;
  let frameBorder = theme.colors.border;

  if (errorText) {
    frameBorder = theme.colors.expense;
  } else if (focused) {
    frameBorder = theme.colors.accent;
  }

  return (
    <FieldShell
      disabled={props.disabled}
      error={errorText}
      helper={helperText}
      label={props.label}
      testID={testID}
    >
      <View
        style={[
          styles.frame,
          {
            backgroundColor: theme.colors.surface,
            borderColor: frameBorder,
            borderRadius: theme.radius.md,
            borderWidth: 1,
          },
        ]}
        testID={testID && `${testID}-frame`}
      >
        {isChips
          ? values.map((value) => (
              <View
                key={value}
                style={styles.chip}
                testID={testID && `${testID}-chip-${value}`}
              >
                <Text.BodyStrong
                  color={theme.colors.accentText}
                  numberOfLines={1}
                  value={value}
                />
                <Touchable
                  accessibilityLabel={props.removeLabel(value)}
                  accessibilityRole="button"
                  disabled={props.disabled}
                  focusRadius={theme.radius.full}
                  hitSlop={{ bottom: 8, left: 8, right: 8, top: 8 }}
                  minTouchTarget={false}
                  onPress={() => props.onChange(removeValue(values, value))}
                  style={styles.chipRemove}
                  testID={testID && `${testID}-chip-remove-${value}`}
                >
                  <Icon
                    color={theme.colors.accentText}
                    name="close"
                    size={theme.sizes.iconSm}
                  />
                </Touchable>
              </View>
            ))
          : null}
        <TextInput
          accessibilityLabel={props.label}
          autoCapitalize="none"
          // The list is ours: the browser's own suggestions must not cover it.
          autoComplete="off"
          autoCorrect={false}
          editable={!props.disabled && !atMax}
          maxLength={props.mode === "text" ? props.maxLength : undefined}
          nativeID={testID && `${testID}-input`}
          onBlur={() => {
            if (pressingMenu.current) {
              return;
            }
            closeTimer.current = setTimeout(
              () => setFocused(false),
              BLUR_CLOSE_DELAY,
            );
          }}
          onChangeText={changeText}
          onFocus={() => {
            clearTimeout(closeTimer.current);
            setFocused(true);
          }}
          onKeyPress={keyPress}
          onSubmitEditing={submit}
          placeholder={atMax ? undefined : props.placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          returnKeyType="done"
          style={styles.input}
          submitBehavior="submit"
          testID={testID && `${testID}-input`}
          value={text}
        />
        <FocusRing radius={theme.radius.md} visible={focused} />
      </View>
      {open ? (
        <View
          onStartShouldSetResponderCapture={() => {
            pressingMenu.current = true;

            return false;
          }}
          ref={scrollIntoView}
          style={styles.menu}
          testID={testID && `${testID}-menu`}
        >
          {options.map((option, index) => (
            <Touchable
              accessibilityLabel={option.label}
              accessibilityRole="button"
              key={option.id}
              minTouchTarget={false}
              // Taps must land before the input blurs and closes the list.
              onPress={() => pick(option)}
              selected={index === activeIndex}
              style={[
                styles.option,
                index === activeIndex ? styles.optionActive : undefined,
              ]}
              testID={
                testID &&
                (option.create
                  ? `${testID}-create`
                  : `${testID}-suggestion-${option.label}`)
              }
            >
              {option.leading}
              {option.create ? (
                <Text.BodyStrong
                  color={theme.colors.accentText}
                  numberOfLines={1}
                  value={option.label}
                />
              ) : (
                <OptionLabel option={option} />
              )}
              {option.meta ? <Text.Caption value={option.meta} /> : null}
              {option.trailing}
            </Touchable>
          ))}
        </View>
      ) : null}
      {props.resultsLabel && open ? (
        <View style={styles.srOnly}>
          <Text.Caption
            accessibilityLiveRegion="polite"
            value={props.resultsLabel(options.length)}
          />
        </View>
      ) : null}
    </FieldShell>
  );
}

function buildOptions(
  props: AutocompleteFieldProps,
  text: string,
  values: string[],
  tooLong: boolean,
): Option[] {
  const typed = text.trim();
  const limit = props.maxSuggestions ?? 8;
  const matches = props.suggestions
    .filter(
      (suggestion) =>
        !values.some((value) => sameText(value, suggestion.label)) &&
        (props.prefiltered === true ||
          suggestion.label.toLowerCase().includes(typed.toLowerCase())),
    )
    .slice(0, limit)
    .map((suggestion) => ({
      ...suggestion,
      create: false,
      value: suggestion.label,
    }));

  if (
    props.mode !== "chips" ||
    !props.allowCreate ||
    typed.length === 0 ||
    tooLong ||
    props.suggestions.some((suggestion) => sameText(suggestion.label, typed)) ||
    values.some((value) => sameText(value, typed))
  ) {
    return matches;
  }

  return [
    ...matches,
    {
      create: true,
      id: `create:${typed}`,
      label: props.createLabel ? props.createLabel(typed) : typed,
      meta: undefined,
      value: typed,
    },
  ];
}

// The label, with the matched part in bold when the suggestion says where it is.
function OptionLabel({ option }: { option: Option }) {
  const { styles } = useStyles();
  const [start, end] = option.matchRange ?? [0, 0];

  if (end <= start) {
    return <Text.Body numberOfLines={1} value={option.label} />;
  }

  return (
    <View style={styles.optionLabel}>
      <Text.Body value={option.label.slice(0, start)} />
      <Text.BodyStrong value={option.label.slice(start, end)} />
      <Text.Body numberOfLines={1} value={option.label.slice(end)} />
    </View>
  );
}

function removeValue(values: string[], label: string) {
  return values.filter((value) => value !== label);
}

function sameText(a: string, b: string) {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}

// On the web a list that opens below the visible part of a scrolling sheet is brought into view (no-op on native).
function scrollIntoView(node: unknown) {
  const element = node as null | { scrollIntoView?: (options: object) => void };

  element?.scrollIntoView?.({ block: "nearest" });
}

export default AutocompleteField;
export { scrollIntoView };
