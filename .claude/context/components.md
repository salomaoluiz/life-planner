# Shared components (`src/presentation/components`, alias `@components`)

Import from the barrel: `import { Button, Card, Text } from "@components";` (Icon/IconButton/Skeleton/Picker types come from their subpaths).
All are dumb, theme-aware, and most use a glass look (`BlurView` + `theme.colors.glass*`). Every component accepts `testID`.
If you need a new 3rd-party UI element, **wrap it here first** (folder `Name/index.tsx` + `styles.ts` + `index.test.tsx` + `mocks/index.mocks.tsx`), export from `components/index.tsx`, and mock the lib in `tests/setup.tsx` if needed.

| Component                                               | Usage                             | Key props                                                                                                 |
| ------------------------------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `Text.{Display,Headline,Title,Body,Label,Caption}`      | 48/24/20/16/14/12 px              | `value` (string, required), `bold?`, `color?`, `numberOfLines?`, `textAlign?`                             |
| `Button.{Filled,Outlined,Text}`                         | actions                           | `label`, `onPress`, `disabled?`, `icon?`, `customStyles?` (e.g. `{ textColor }`)                          |
| `Card`                                                  | glass container (also modal body) | `children`, `customStyles?: ViewStyle`                                                                    |
| `TextInput.{Outlined,Flat}`                             | text fields                       | `value`, `onChangeText`, `label?`, `keyboardType?`, `multiline?`, `disabled?`                             |
| `HelperText`                                            | field error/info                  | `label`, `type: "error" \| "info"`, `visible?` (renders null when hidden)                                 |
| `Picker<T>`                                             | select                            | `items: {label, value}[]`, `selectedValue`, `onValueChange`, `label?`                                     |
| `DatePicker`                                            | single date                       | `label`, `mode: "single"`, `date?`, `onConfirm({ date })`, `onDismiss?`                                   |
| `Switch`                                                | toggle                            | `initialStatus`, `onToggle(status)`                                                                       |
| `Spacer`                                                | gaps / divider                    | `direction: "vertical"\|"horizontal"\|"both"`, `size: spacing key \| "flex" \| "full"`, `horizontalLine?` |
| `Fab`, `FabGroup`                                       | floating action                   | `Fab`: `icon`, `onPress`                                                                                  |
| `Menu`                                                  | dropdown menu                     | `anchor`, `visible`, `onDismiss`, `children`                                                              |
| `Accordion.{Container,Item}`                            | collapsible groups                | see `Accordion/`                                                                                          |
| `Avatar`                                                | user/family avatar                | `mode: "icon"\|"image"\|"text"`, `source`, `size: "small"\|"regular"\|"large"`                            |
| `Icon` (default) / `IconButton` from `@components/Icon` | MaterialCommunityIcons            | `name`, `size`, `color?`; `IconButton` + `onPress`                                                        |
| `Skeleton.{Box,Circle}` from `@components/Skeleton`     | loading placeholders              | see files                                                                                                 |

Screen-local reusable pieces already exist, check before creating: `@screens/Financial/Transactions/containers/RefetchCache` (header refresh), `ItemSeparator` (Transactions, Family).
