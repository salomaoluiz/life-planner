# Life Planner AI Context Map

## Tech Stack

```yaml
stack:
  core: React Native, Expo
  language: TypeScript
  navigation: React Navigation, Expo Router
  state_management: React Query, React Context
  ui: React Native Paper, React Native Elements (RNEUI)
  auth: Email/password on the NestJS API (JWT)
  backend_as_a_service: Supabase
  testing: Jest, React Native Testing Library
```

## Architecture

```yaml
pattern: Clean Architecture
layers:
  - domain: Entities, Error Definitions, Repository Interfaces
  - application: Use Cases (business rules execution)
  - data: Models, Datasources, Repository Implementations
  - infrastructure: External services configuration (Supabase, API client, token storage)
  - presentation: Screens, Components, Hooks, Containers
  - navigation: App Routing
  - providers: Context Providers
  - utils: Helper functions
```

## Modules

```yaml
available_modules:
  - auth
  - family
  - familyMember
  - financial
  - stock
```

## Golden Rules for AI Code Generation

To maintain the architectural integrity of the Life Planner application, all AI-generated code must strictly adhere to the following guardrails:

- **Domain Purity**: The domain layer must be written in 100% pure TypeScript. It cannot contain imports from React, React Native, Expo, or any external dependency listed in the `package.json`.
- **Coupling Direction**: The architecture follows a strict outside-in dependency rule. The presentation layer imports application. The application layer imports domain. The domain layer does not import anything outside of itself.
- **Business Logic Orchestration**: All business rules must be orchestrated exclusively by Use Cases within the application layer.
- **Continuous Documentation**: Every time code is modified, refactored, or generated, its corresponding AI-context documentation on `docs/ai` must be updated in tandem to reflect the new state. You should not commit the plan, but enhance or create a new documentation following the already existent ones.
- **Linters Execution**: You should not run the tests, linter, and prettier everytime, these will be runned only on the end of the implementation, and not manually, you should create the commit and the husky will run it and response with the failures to be fixed.
-

## DOs and DON'Ts Cheat Sheet

### External Libraries

**DO:** Define contracts (Interfaces) in the domain, data, application or presentation folder and implement them exclusively in the infrastructure layer.

```typescript
// DO: Domain interface
export interface StorageRepository {
  save(key: string, value: string): Promise<void>;
}
```

**DON'T:** Leak external dependencies (e.g., HTTP clients, storage, date libraries) into the domain or application layers.

```typescript
// DON'T: Importing external libraries in Domain
import AsyncStorage from "@react-native-async-storage/async-storage";
```

### UI Components

**DO:** Build "Dumb Components" inside `presentation/components` that only receive properties (props) and emit events (callbacks).

```tsx
// DO: Dumb component
export const CustomButton = ({ title, onPress }: Props) => (
  <Button title={title} onPress={onPress} />
);
```

**DON'T:** Insert business rules, service calls, or complex logic directly inside visual components.

```tsx
// DON'T: Business logic in component
export const LoginButton = () => {
  const handlePress = async () => {
    await api.post("/v1/auth/login/email", params);
  };
  return <Button title="Login" onPress={handlePress} />;
};
```

### Testing

**DO:** Prioritize unit test coverage for the domain and application layers, mocking the infrastructure layer.

```typescript
// DO: Mocking infrastructure
const mockRepo = { getFamilyById: jest.fn().mockResolvedValue(mockFamily) };
const useCase = getFamilyByIdUseCase(mockRepo);
```

**DON'T:** Focus only on the "happy path"; you must simulate error scenarios using mocks.

```typescript
// DON'T: Only happy path testing (ignoring negative paths)
it("should return true", async () => {
  /* ... */
});
```

### Error Handling

**DO:** Format errors originating in the infrastructure layer and propagate them up so the presentation layer can handle the UI appropriately.

```typescript
// DO: Propagating formatted errors
if (error.code === "auth/invalid-email") {
  throw new BusinessError("Invalid Email");
}
```

**DON'T:** Swallow errors using empty try/catch blocks or simply print them using `console.log`.

```typescript
// DON'T: Swallowing errors
try {
  await api.fetchData();
} catch (e) {
  console.log(e);
}
```

### Typing & Linting

**DO:** Infer types correctly by creating clear DTOs (Data Transfer Objects) and interfaces.

```typescript
// DO: Clear typing
export interface FamilyDTO {
  id: string;
  name: string;
}
```

**DON'T:** Use `any`, `@ts-ignore`, or suppression comments to bypass linter and formatting rules.

```typescript
// DON'T: Bypassing rules
// eslint-disable-next-line
const data: any = await fetchData();
```

### Documentation

**DO:** Update the respective AI-context module immediately after altering, deleting, or adding new code structures.

```yaml
# DO: Keep module docs updated
use_cases:
  newFeatureUseCase:
    path: src/application/useCases/...
```

**DON'T:** Change code without reflecting those changes in the AI documentation, causing the LLM to hallucinate on outdated context.

```markdown
<!-- DON'T: Leaving documentation stale after refactoring -->
```

### Components

**DO:** Reuse dummy components from the `src/presentation/components` every time that this component will need to be reused or you need a component from an external library.

**DON'T:** Duplicate a component with a similar behavior across multiple screens or use a component from a library direct on the screen.

### Translations

**DO:** Always create the translations keys and values on the folder `presentation/i18n`, and use it with the `presentation/i18n/useTranslation`.

**DON'T:** Use hardcoded translations direct on the screens and components.
