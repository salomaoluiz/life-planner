# Routing (`app/`, expo-router v4)

Route files are **one-line re-exports** of screens; no logic in `app/`.

```
app/
  _layout.tsx                    root Stack + ErrorBoundaries + GlobalProviders
  login.tsx
  (app)/_layout.tsx              redirects to /login when !useUser().logged; Stack of (tabs) + (modals)
  (app)/(tabs)/_layout.tsx       bottom Tabs (index, stock, family, financial, config) — titles via t()
  (app)/(tabs)/index/index.tsx   Home
  (app)/(tabs)/stock/index.tsx
  (app)/(tabs)/family/index.tsx
  (app)/(tabs)/financial/_layout.tsx   Drawer: index(Transactions), categories, accounts
  (app)/(tabs)/financial/{index,categories,accounts}.tsx
  (app)/(tabs)/config/index.tsx
  (app)/(modals)/_layout.tsx     Stack, presentation "transparentModal", headerShown false
  (app)/(modals)/family/add_new_family.tsx, add_new_family_member.tsx
  (app)/(modals)/financial/{account/add_new_account, category/add_new_category, transaction/add_new_transaction}.tsx
  (app)/(modals)/stock/add_new_stock_item.tsx
  (app)/(modals)/business_feedback.tsx, invite.tsx
```

## Add a screen

1. Export it in `src/presentation/screens/index.tsx`.
2. Route file: `export { FinancialAccounts as default } from "@screens";`
3. Register in the parent layout: `<Tabs.Screen name="x/index" options={{ title: t("x.routeTitle"), tabBarIcon: ({color,size}) => <Icon color={color} name="..." size={size} /> }} />` or a `<Drawer.Screen>` in `financial/_layout.tsx`. Icons are MaterialCommunityIcons names via `@components/Icon`.

## Add a modal

1. Route file `app/(app)/(modals)/<module>/<thing>/add_new_<thing>.tsx`: `export { NewXModal as default } from "@screens/<Area>/<Screen>/modals";`
2. Add `<Stack.Screen name={"<module>/<thing>/add_new_<thing>"} />` to `app/(app)/(modals)/_layout.tsx`.
3. Open it: `router.push("/<module>/<thing>/add_new_<thing>" as any)` (groups are omitted from the URL; `as any` + eslint-disable comment is the accepted pattern because typed routes lag).
