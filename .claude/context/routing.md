# Routing (`app/`, expo-router v4)

Route files are **one-line re-exports** of screens; no logic in `app/`.

```
app/
  _layout.tsx                    root Stack + ErrorBoundaries + GlobalProviders
  login.tsx, signup.tsx
  (app)/_layout.tsx              redirects to /login when !useUser().logged; Stack of (tabs) and (modals)
  (app)/(tabs)/settings.tsx      Config screen, a hidden tab (`href: null`) so the rail/tab bar stay visible; opened from the profile button
  (app)/config.tsx               redirect to /settings (old URL)
  (app)/(tabs)/_layout.tsx       Tabs with custom tabBar (AppTabBar): index/index, financial, stock/index, family/index; backBehavior "initialRoute"; tabBarPosition "left" + rail on expanded (>= 1024 px)
  (app)/(tabs)/index/index.tsx   Home
  (app)/(tabs)/stock/index.tsx, family/index.tsx
  (app)/(tabs)/financial/_layout.tsx   FinancialLayout: ScreenHeader (overline "Finances" + section title; below `expanded` the title opens the section picker) + nested Stack (index, overview, categories, tags, accounts, cards); sections come from `FINANCIAL_SECTIONS` and switching uses router.replace (spec 044)
  (app)/(modals)/_layout.tsx     Stack, presentation "transparentModal", headerShown false; one screen, the catch-all
  (app)/(modals)/[...modal].tsx  ModalRoute (src/navigation): the last URL segment is the modal, resolved through MODAL_ROUTES (src/navigation/modalRoutes.tsx)
```

## Add a screen

1. Export it in `src/presentation/screens/index.tsx`.
2. Route file: `export { FinancialAccounts as default } from "@screens";`
3. Register in the parent layout. `Tabs` order is the order of `NAVIGATION_ITEMS` (`src/presentation/screens/Navigation/models/navigationItems.ts`); a new tab needs an entry there (icon, `navigation.tabs.*` key, route name) and a `<Tabs.Screen>`. "Add" buttons live in quick add or in the screen (no FAB). Icons are MaterialCommunityIcons names via `@components/Icon`.

## Navigation

Tab screens hide the navigator header (the title comes from `ScreenHeader`). Quick add is `QUICK_ADD_PATH`. Android back goes to Home (`backBehavior: "initialRoute"`). `/config` redirects to `/settings`.

## Modals (spec 057)

A modal URL is `<base>/<modal>`: `<base>` is the screen it was opened from, `<modal>` is only the modal name (one segment, no folder), params stay in the query (`/financial/overview/add_new_transaction?id=…`, `/settings/versions`, `/invite?token=…` falls back to Family). Valid bases (`VALID_BASES` in `Navigation/models/modalPath.ts`, derived from `FINANCIAL_SECTIONS`): `/`, `/financial/transaction`, `/financial/overview`, `/financial/categories`, `/financial/tags`, `/financial/accounts`, `/financial/cards`, `/stock`, `/family`, `/settings`. Transactions is `/financial/transaction`; `/financial` redirects there.

- Pure rules: `splitModalPath`, `buildModalPath`, `isValidBase`, `fallbackBase`, `screenPath` (strips the modal segment; use it before `getFinancialSection(usePathname())`) in `src/presentation/screens/Navigation/models/modalPath.ts`.
- Open/close only through `useModalNavigation()` (`@screens/Navigation/hooks/useModalNavigation`): `openModal(name, params?)` pushes, `replaceModal(name, params?)` replaces keeping the base, `closeModal()` goes back or, with nothing below, replaces to the base. Never build modal paths by hand or call `router.back()` in a modal. Tests assert `modalNavigation.openModal|replaceModal|closeModal` from `@tests/modalNavigation` (global mock in `tests/setup.tsx`).
- Fresh load (F5, direct link): `app/(app)/_layout.tsx` sets `unstable_settings.initialRouteName = "(tabs)"` and `useScreenBehindModal` (`src/navigation`) rebuilds `[(tabs) at base, (modals)]` (dismissAll → navigate(base) → push(modal)) behind an opaque cover. Invalid or missing base → Home behind (invite → Family). Unknown modal name → not found.

## Add a modal

1. Add the name to `MODAL_NAMES` in `modalPath.ts` and the component to `MODAL_ROUTES` in `src/navigation/modalRoutes.tsx` (typed `Record<ModalName, ComponentType>`, so TypeScript flags a missing entry). No route file and no `Stack.Screen`.
2. Open it with `openModal("<name>", params)` and close it with `closeModal()` from `useModalNavigation()`.

- The signed-in layout `app/(app)/_layout.tsx` renders `UpdateBanner` above the stack (spec 056); the versions modal is `versions` (opened from the Settings footer).
