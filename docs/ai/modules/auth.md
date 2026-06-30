# Auth Module Context

## Domain

```yaml
entities:
  LoginWithGoogleEntity:
    path: src/domain/entities/auth/LoginWithGoogleEntity.ts
    properties:
      - id: string
      - name: string
      - email: string
      - avatarURL: string

interfaces:
  LoginRepository:
    path: src/domain/repositories/auth/loginRepository.ts
    methods:
      - loginWithGoogle(): Promise<LoginWithGoogleEntity | undefined>
      - logout(): Promise<void>
      - saveSession(params: SaveSessionParams): Promise<LoginWithGoogleEntity>

errors:
  - name: LoginCanceled
    path: src/domain/entities/errors/auth/LoginCanceled.ts
  - name: UserNotLogged
    path: src/domain/entities/errors/auth/UserNotLogged.ts
```

## Application

```yaml
use_cases:
  loginWithGoogleUseCase:
    path: src/application/useCases/cases/auth/loginWithGoogleUseCase.ts
    receives: void
    returns: Promise<void>
    behavior: Executes login, checks if user exists in userRepository, creates if missing.

  logoutUseCase:
    path: src/application/useCases/cases/auth/logoutUseCase.ts
    receives: void
    returns: Promise<void>
    behavior: Executes logout via loginRepository.

  saveWebSessionUseCase:
    path: src/application/useCases/cases/auth/saveWebSessionUseCase.ts
    receives: { accessToken: string, refreshToken: string }
    returns: Promise<void>
    behavior: Saves session after web OAuth redirect.
```

## Infrastructure

```yaml
repositories:
  loginRepositoryImpl:
    path: src/data/repositories/repos/auth/loginRepositoryImpl.ts
    implements: LoginRepository
    dependencies: [LoginDatasource]

datasources:
  loginDatasourceImpl:
    path: src/data/datasource/data/auth/supabase/loginDatasourceImpl.ts
    connection: Supabase Auth
    methods:
      - loginWithIdToken: Uses native Google Sign-In token
      - loginWithOAuth: Redirects to web OAuth
      - logout: Calls supabase.auth.signOut()
      - saveSession: Calls supabase.auth.setSession()

external_connections:
  - name: Google OAuth
    path: src/infrastructure/googleOAuth/rnGoogleSignIn/index.ts
  - name: Supabase
    path: src/infrastructure/supabase/index.ts
```

## Presentation

```yaml
screens:
  Login:
    path: src/presentation/screens/Login/index.tsx
    variants: [mobile, web]

components:
  - name: GoogleButton
    path: src/presentation/screens/Login/components/GoogleButton/index.tsx
    triggers: OAuth or Native sign in
  - name: Welcome
    path: src/presentation/screens/Login/components/Welcome/index.tsx
    description: greeting UI

hooks:
  - name: useLogin
    path: src/presentation/screens/Login/hooks/useLogin.ts
    orchestrates: loginWithGoogleUseCase
  - name: useSaveSession
    path: src/presentation/screens/Login/hooks/useSaveSession.ts
    orchestrates: saveWebSessionUseCase

containers:
  - name: LoginContainer
    path: src/presentation/screens/Login/containers/index.tsx
    description: wraps components with layout and logic
```
