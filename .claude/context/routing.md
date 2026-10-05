# Routing (`app/`, expo-router v4)

Route files are **one-line re-exports** of screens; no logic in `app/`.

```
app/
  _layout.tsx                    root Stack + ErrorBoundaries + GlobalProviders
  login.tsx, signup.tsx
  (app)/_layout.tsx              redirects to /login when !useUser().logged; Stack of (tabs), (modals) and settings
  (app)/settings.tsx             Config screen, pushed from the Home profile button (outside the tabs)
  (app)/config.tsx               redirect to /settings (old URL)
  (app)/(tabs)/_layout.tsx       Tabs with custom tabBar (AppTabBar): index/index, financial, stock/index, family/index; backBehavior "initialRoute"; tabBarPosition "left" + rail on expanded (>= 1024 px)
  (app)/(tabs)/index/index.tsx   Home
  (app)/(tabs)/stock/index.tsx, family/index.tsx
  (app)/(tabs)/financial/_layout.tsx   FinancialLayout: ScreenHeader + SegmentedControl + nested Stack (index, categories, accounts); switching uses router.replace
  (app)/(tabs)/financial/{index,categories,accounts}.tsx
  (app)/(modals)/_layout.tsx     Stack, presentation "transparentModal", headerShown false
  (app)/(modals)/quick_add.tsx   quick-add BottomSheet (Transaction / Stock item); options router.replace to the add forms
  (app)/(modals)/family/..., financial/..., stock/add_new_stock_item.tsx, business_feedback.tsx, invite.tsx
```

## Add a screen

1. Export it in `src/presentation/screens/index.tsx`.
2. Route file: `export { FinancialAccounts as default } from "@screens";`
3. Register in the parent layout. `Tabs` order is the order of `NAVIGATION_ITEMS` (`src/presentation/screens/Navigation/models/navigationItems.ts`); a new tab needs an entry there (icon, `navigation.tabs.*` key, route name) and a `<Tabs.Screen>`. "Add" buttons live in quick add or in the screen (no FAB). Icons are MaterialCommunityIcons names via `@components/Icon`.

## Navigation

Tab screens hide the navigator header (the title comes from `ScreenHeader`). Quick add is `QUICK_ADD_PATH`. Android back goes to Home (`backBehavior: "initialRoute"`). `/config` redirects to `/settings`.

## Add a modal

1. Route file `app/(app)/(modals)/<module>/<thing>/add_new_<thing>.tsx`: `export { NewXModal as default } from "@screens/<Area>/<Screen>/modals";`
2. Add `<Stack.Screen name={"<module>/<thing>/add_new_<thing>"} />` to `app/(app)/(modals)/_layout.tsx`.
3. Open it: `router.push("/<module>/<thing>/add_new_<thing>" as any)` (groups are omitted from the URL; `as any` + eslint-disable comment is the accepted pattern because typed routes lag).
