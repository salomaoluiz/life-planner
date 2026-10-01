# Architecture

## Layers & folders

```
app/                               expo-router routes (thin: re-export screens)
src/
  domain/                          PURE TS
    entities/<module>/XEntity.ts   classes + enums
    entities/errors/<area>/        BusinessError / GenericError subclasses
    entities/cache/keys.ts         CacheStringKeys enum
    repositories/<module>/         repository interfaces (types) + Params
    repositories/index.ts          `Repositories` aggregate interface
  data/
    models/<module>/XModel.ts      snake_case <-> camelCase (fromJSON/toJSON)
    datasource/data/<module>/...   Supabase implementations
    repositories/repos/<module>/   repository impls + datasource interfaces
  application/
    dto/<module>/XDTO.ts           Entity -> DTO (static fromEntity)
    useCases/cases/<module>/       use case factories
    providers/                     app-level contexts (UserProvider/useUser)
  infrastructure/                  wrappers over external libs
    supabase/ fetcher/ cache/ storage/ monitoring/ googleOAuth/ date/ crypto/
  presentation/
    components/                    shared dumb UI (@components)
    screens/<Screen>/              MVVM: index.tsx (View), hooks/use*ViewModel.ts, models/*UIModel.ts
    i18n/ theme/ providers/ utils/
  navigation/                      useInitializeRouter
  providers/                       global providers composition + loader
  utils/                           device, platform, types
tests/                             test utils (@tests), jest setup
```

## Dependency-injection chain (auto-wired, module-level singletons)

```
listDatasources (src/data/datasource/data/index.ts)
  -> injectionDatasources() calls each factory  -> `datasources` / type `Datasources`
listRepositories (src/data/repositories/repos/index.ts)
  -> injectionRepository({ dataSources })       -> `repositories` (typed by domain `Repositories`)
listUseCases (src/application/useCases/cases/index.ts)
  -> injectionUseCases({ repositories })        -> `useCases` (import from "@application/useCases")
```

- Keys of each `list*` object become property names: e.g. `datasources.financialAccountDatasource`, `repositories.financialRepository.account`, `useCases.getFinancialAccountsUseCase`.
- Adding a new piece = export a factory from the module `index.ts` and make sure it's spread into the `list*` object (and into the domain `Repositories` interface + the mock lists — see `testing.md`).

## Runtime data flow

```
View -> use<Name>ViewModel --useQuery/useMutation(@infrastructure/fetcher)--> useCases.X.execute(params)
  -> repositories.<repo>.<method>()  (cache read/invalidate via @infrastructure/cache)
    -> datasources.<ds>.<method>()   (supabase.from("<table>"))
      -> Model.fromJSON -> Entity -> DTO -> <Name>UIModel (returned by the ViewModel hook to the View)
```

## Path aliases (tsconfig)

`@/*` root · `@assets/*` · `@screens`, `@screens/*` → `src/presentation/screens` · `@components`, `@components/*` · `@presentation/*` · `@domain/*` · `@application`, `@application/*` · `@infrastructure`, `@infrastructure/*` · `@data`, `@data/*` · `@navigation` · `@utils`, `@utils/*` · `@providers/*` · `@tests`, `@tests/*`.

Relative imports deeper than one parent (`../../`) are lint errors — use aliases.

## Ownership model (cross-cutting)

Most records belong to an **owner**: `owner: OwnerType.USER | OwnerType.FAMILY` + `ownerId` (user id or family id). DB trigger `validate_owner()` enforces it.
`useCases.getOwnersUseCase.execute()` returns `OwnerDTO[]` (user + their families); screens pass `owners.map(o => o.id)` to list use cases.
