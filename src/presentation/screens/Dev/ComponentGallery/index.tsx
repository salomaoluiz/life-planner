// Dev-only tool (__DEV__ route): plain English literals, exempt from i18n.
import { useState } from "react";
import { View } from "react-native";

import {
  AmountInput,
  AmountText,
  AutocompleteField,
  Avatar,
  Badge,
  BarList,
  BottomSheet,
  Button,
  Card,
  ChartCard,
  Chip,
  ChipGroup,
  ColumnChart,
  ConfirmDialog,
  DateField,
  Divider,
  EmptyState,
  ErrorState,
  FormColumns,
  Icon,
  IconTile,
  LineChart,
  ListItem,
  MetricBlock,
  PieBreakdown,
  Screen,
  ScreenHeader,
  SearchField,
  Section,
  SegmentedControl,
  SelectField,
  StatTile,
  Switch,
  Text,
  TextField,
  Toast,
} from "@components";
import { IconButton } from "@components/Icon";
import Skeleton from "@components/Skeleton";
import { ThemeMode } from "@domain/entities/configs/ConfigsEntity";
import { DEFAULT_CURRENCY } from "@domain/entities/financial/Currency";
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
  const [tags, setTags] = useState<string[]>(["gasto-fixo"]);
  const [described, setDescribed] = useState("");
  const [search, setSearch] = useState("");
  const [select, setSelect] = useState<string | undefined>(undefined);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [cents, setCents] = useState(0);
  const [single, setSingle] = useState<string | undefined>("food");
  const [multiple, setMultiple] = useState<string[]>(["food"]);
  const [segment, setSegment] = useState("expense");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

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
        <Button.Secondary
          label="Show toast"
          onPress={() => setToastOpen(true)}
          testID="gallery-open-toast"
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
            currency={DEFAULT_CURRENCY}
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
        <AutocompleteField
          allowCreate
          createLabel={(query) => `Create "${query}"`}
          label="Tags (chips)"
          maxValues={10}
          mode="chips"
          onChange={setTags}
          placeholder="Add tag"
          removeLabel={(label) => `Remove ${label}`}
          suggestions={[
            { id: "1", label: "gasto-fixo", meta: "24" },
            { id: "2", label: "viagem", meta: "3" },
          ]}
          testID="gallery-autocomplete-chips"
          values={tags}
        />
        <AutocompleteField
          label="Description (text)"
          mode="text"
          onChangeText={setDescribed}
          suggestions={[{ id: "1", label: "Monthly groceries" }]}
          testID="gallery-autocomplete-text"
          value={described}
        />
      </Section>

      <Section testID="gallery-display" title="Display">
        <ListItem
          divider
          leading={<IconTile name="cart" tone="expense" />}
          subtitle="Subtitle"
          title="With tile"
          trailing={
            <AmountText
              currency={DEFAULT_CURRENCY}
              type="EXPENSE"
              value={31290}
            />
          }
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
          <AmountText
            currency={DEFAULT_CURRENCY}
            key={size}
            size={size}
            type="INCOME"
            value={125000}
          />
        ))}
        <AmountText currency={DEFAULT_CURRENCY} type="EXPENSE" value={31290} />
        <StatTile
          delta={{ text: "▲ 8,4%", tone: "good" }}
          label="Income"
          value="R$ 12.400,00"
        />
        <ChartCard
          errorText="Couldn't load this chart"
          legend={[
            { label: "Actual", tone: "accent" },
            { dashed: true, label: "Expected", tone: "accent" },
          ]}
          onRetry={noop}
          retryLabel="Try again"
          state="ready"
          title="Balance over time"
        >
          <LineChart
            accessibilityLabel="Balance from Nov to Jan"
            formatTick={(value) => `${value / 1000}k`}
            formatValue={(value) => `R$ ${value}`}
            points={[
              { label: "Nov", projected: false, value: 8200 },
              { label: "Dec", projected: false, value: 10400 },
              { label: "Jan", projected: true, value: 9800 },
            ]}
            selectedIndex={1}
          />
          <ColumnChart
            accessibilityLabel="Income and expenses"
            formatTick={(value) => `${value / 1000}k`}
            formatValue={(value) => `R$ ${value}`}
            groups={[
              {
                expense: { projected: 0, realized: 4000 },
                income: { projected: 0, realized: 9000 },
                label: "Nov",
              },
              {
                expense: { projected: 800, realized: 3000 },
                income: { projected: 1500, realized: 5000 },
                label: "Dec",
              },
            ]}
          />
          <PieBreakdown
            rows={[
              {
                id: "a",
                label: "Groceries",
                percent: "60%",
                ratio: 1,
                value: "R$ 600,00",
              },
              {
                id: "o",
                label: "Other",
                muted: true,
                percent: "40%",
                ratio: 0.6,
                value: "R$ 400,00",
              },
            ]}
          />
          <BarList
            onPress={noop}
            rows={[
              {
                id: "a",
                label: "Groceries",
                percent: "60%",
                ratio: 1,
                value: "R$ 600,00",
              },
              {
                id: "o",
                label: "Other",
                muted: true,
                percent: "40%",
                ratio: 0.6,
                value: "R$ 400,00",
              },
            ]}
            tone="expense"
          />
        </ChartCard>
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
        size="form"
        testID="gallery-sheet"
        title="Sheet"
        visible={sheetOpen}
      >
        <FormColumns
          left={<TextField label="Left column" onChangeText={noop} value="" />}
          right={
            <TextField label="Right column" onChangeText={noop} value="" />
          }
          testID="gallery-sheet"
        />
      </BottomSheet>
      <Toast
        message="Transaction saved"
        onHide={() => setToastOpen(false)}
        testID="gallery-toast"
        visible={toastOpen}
      />
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
