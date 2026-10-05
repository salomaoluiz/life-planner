// Dev-only tool (__DEV__ route): plain English literals, exempt from i18n.
import { useState } from "react";
import { View } from "react-native";

import {
  AmountInput,
  AmountText,
  Avatar,
  Badge,
  BottomSheet,
  Button,
  Card,
  Chip,
  ChipGroup,
  ConfirmDialog,
  DateField,
  Divider,
  EmptyState,
  ErrorState,
  Icon,
  IconTile,
  ListItem,
  MetricBlock,
  Screen,
  ScreenHeader,
  SearchField,
  Section,
  SegmentedControl,
  SelectField,
  Switch,
  Text,
  TextField,
} from "@components";
import { IconButton } from "@components/Icon";
import Skeleton from "@components/Skeleton";
import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";
import { useTheme } from "@presentation/theme";

const TONES = ["accent", "expense", "income", "neutral", "warning"] as const;
const TEXT_TONES = [
  "primary",
  "secondary",
  "accent",
  "income",
  "expense",
  "warning",
] as const;
const SELECT_OPTIONS = [
  { label: "Checking", value: "checking" },
  { label: "Savings", value: "savings" },
  { label: "Wallet", value: "wallet" },
];
const CHIP_OPTIONS = [
  { label: "Food", value: "food" },
  { count: 3, label: "Rent", value: "rent" },
  { colorDot: "tomato", label: "Fun", value: "fun" },
  { label: "Add", value: "add", variant: "add" as const },
];
const SEGMENTS = [
  { label: "Expense", tone: "expense" as const, value: "expense" },
  { label: "Income", tone: "income" as const, value: "income" },
];
function ComponentGallery() {
  const { isDark, setThemeMode, theme } = useTheme();
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  const [select, setSelect] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [cents, setCents] = useState(0);
  const [single, setSingle] = useState<string | undefined>("food");
  const [multiple, setMultiple] = useState<string[]>(["food"]);
  const [segment, setSegment] = useState("expense");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  function onToggleTheme(dark: boolean) {
    setThemeMode(dark ? ThemeMode.DARK : ThemeMode.LIGHT);
  }

  return (
    <Screen scroll testID="gallery">
      <ScreenHeader
        actions={
          <Switch
            initialStatus={isDark}
            onToggle={onToggleTheme}
            testID="gallery-theme-toggle"
          />
        }
        overline="Dev"
        subtitle="Every kit component, light and dark"
        title="Component gallery"
      />

      <Section testID="gallery-typography" title="Typography">
        <Text.Display value="Display" />
        <Text.Title value="Title" />
        <Text.Heading value="Heading" />
        <Text.Body value="Body" />
        <Text.BodyStrong value="BodyStrong" />
        <Text.Caption value="Caption" />
        <Text.Overline value="Overline" />
        <Text.Tab value="Tab" />
        {TEXT_TONES.map((tone) => (
          <Text.Body key={tone} tone={tone} value={`Body ${tone}`} />
        ))}
      </Section>

      <Section testID="gallery-actions" title="Actions">
        {(["Primary", "Secondary", "Ghost", "Destructive"] as const).map(
          (variant) => {
            const Variant = Button[variant];

            return (
              <View key={variant}>
                <Variant label={variant} onPress={noop} />
                <Variant label={`${variant} loading`} loading onPress={noop} />
                <Variant
                  disabled
                  label={`${variant} disabled`}
                  onPress={noop}
                />
                <Variant icon="plus" label={`${variant} icon`} onPress={noop} />
                <Variant label={`${variant} lg`} onPress={noop} size="lg" />
              </View>
            );
          },
        )}
        <IconButton
          accessibilityLabel="Raised"
          name="plus"
          onPress={noop}
          variant="raised"
        />
        <IconButton
          accessibilityLabel="Plain"
          name="plus"
          onPress={noop}
          variant="plain"
        />
        <Button.Secondary
          label="Open sheet"
          onPress={() => setSheetOpen(true)}
          testID="gallery-open-sheet"
        />
        <Button.Secondary
          label="Open confirm"
          onPress={() => setConfirmOpen(true)}
          testID="gallery-open-confirm"
        />
      </Section>

      <Section testID="gallery-inputs" title="Inputs">
        <TextField label="Default" onChangeText={setText} value={text} />
        <TextField
          error="Something is wrong"
          label="Error"
          onChangeText={setText}
          value={text}
        />
        <TextField
          helper="Helper text"
          label="Helper"
          onChangeText={setText}
          value={text}
        />
        <TextField
          disabled
          label="Disabled"
          onChangeText={setText}
          value={text}
        />
        <TextField
          label="Multiline"
          multiline
          onChangeText={setText}
          value={text}
        />
        <TextField
          hidePasswordLabel="Hide"
          label="Secure"
          onChangeText={setText}
          secureTextEntry
          showPasswordLabel="Show"
          value={text}
        />
        <SearchField
          clearLabel="Clear"
          onChangeText={setSearch}
          placeholder="Search"
          value={search}
        />
        <SelectField
          closeLabel="Close"
          label="Select"
          onChange={setSelect}
          options={SELECT_OPTIONS}
          sheetTitle="Pick one"
          value={select}
        />
        <DateField
          clearable
          clearLabel="Clear"
          label="Date"
          onChange={setDate}
          value={date}
        />
        {(["income", "expense", "neutral"] as const).map((tone) => (
          <AmountInput
            key={tone}
            label={`Amount ${tone}`}
            onChange={setCents}
            tone={tone}
            value={cents}
          />
        ))}
        <ChipGroup
          label="Single wrap"
          layout="wrap"
          mode="single"
          onChange={setSingle}
          options={CHIP_OPTIONS}
          value={single}
        />
        <ChipGroup
          label="Multiple scroll"
          layout="scroll"
          mode="multiple"
          onChange={setMultiple}
          options={CHIP_OPTIONS}
          value={multiple}
        />
        <Chip label="Default" onPress={noop} />
        <Chip label="Selected" onPress={noop} selected />
        <SegmentedControl
          accessibilityLabel="Type"
          onChange={setSegment}
          options={SEGMENTS}
          value={segment}
        />
      </Section>

      <Section testID="gallery-display" title="Display">
        <ListItem
          divider
          leading={<IconTile name="cart" tone="expense" />}
          subtitle="Subtitle"
          title="With tile"
          trailing={<AmountText type="EXPENSE" value={31290} />}
        />
        <ListItem
          leading={<Avatar name="Jane Doe" />}
          title="A very long title that should truncate instead of breaking the layout of the row"
          trailing={<Badge label="Badge" tone="accent" />}
        />
        {TONES.map((tone) => (
          <View key={tone}>
            <IconTile name="star" tone={tone} />
            <Badge label={tone} tone={tone} />
          </View>
        ))}
        <IconTile color={theme.colors.accent} label="Groceries" name="food" />
        {(["sm", "md", "lg"] as const).map((size) => (
          <Avatar key={size} name="Jane Doe" size={size} />
        ))}
        <Avatar name="No Photo" />
        <Avatar name="Pending" pending />
        {(["body", "caption", "heading", "display"] as const).map((size) => (
          <AmountText key={size} size={size} type="INCOME" value={125000} />
        ))}
        <AmountText type="EXPENSE" value={31290} />
        <MetricBlock label="Income" trend="income" value="R$ 1.000,00" />
        <MetricBlock label="Expense" trend="expense" value="R$ 500,00" />
        <EmptyState
          actionLabel="Add"
          message="Nothing here yet"
          onAction={noop}
          title="Empty"
        />
        <EmptyState
          message="Nothing here yet"
          title="Empty expense"
          tone="expense"
        />
        <ErrorState
          message="Could not load"
          onRetry={noop}
          retryLabel="Try again"
          title="Error"
        />
        <Skeleton.ListItem />
        <Skeleton.Card />
        <Divider />
        <Divider inset />
        <Icon name="star" size={theme.sizes.size.iconLg} />
      </Section>

      <Section testID="gallery-containers" title="Containers">
        {(["sm", "md", "lg"] as const).map((padding) => (
          <Card key={padding} padding={padding}>
            <Text.Body value={`Card ${padding}`} />
          </Card>
        ))}
        <Card onPress={noop}>
          <Text.Body value="Pressable card" />
        </Card>
        <Card variant="dashed">
          <Text.Body value="Dashed card" />
        </Card>
      </Section>

      <BottomSheet
        closeLabel="Close"
        footer={
          <Button.Primary fullWidth label="Save" onPress={noop} size="lg" />
        }
        onClose={() => setSheetOpen(false)}
        testID="gallery-sheet"
        title="Sheet"
        visible={sheetOpen}
      >
        <Text.Body value="Sheet body" />
      </BottomSheet>
      <ConfirmDialog
        cancelLabel="Cancel"
        closeLabel="Close"
        confirmLabel="Delete"
        message="This cannot be undone"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => setConfirmOpen(false)}
        testID="gallery-confirm"
        title="Delete item?"
        visible={confirmOpen}
      />
    </Screen>
  );
}

function noop() {
  return undefined;
}

export default ComponentGallery;
