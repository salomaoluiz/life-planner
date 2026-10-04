# Auth Module Context

Email + password against the NestJS API (`../life-planner-back`). Google Sign-In and `supabase.auth.*` were removed (spec 002). There is no refresh token: when the JWT expires the API answers 401 and the app sends the user back to `/login`.

## Domain

```yaml
interfaces:
  LoginRepository:
    path: src/domain/repositories/auth/loginRepository.ts
    methods:
      - loginWithEmail(params: { email, password }): Promise<void> # stores the token
      - signUpWithEmail(params: { email, name, password }): Promise<void>
      - logout(): Promise<void> # local only, never fails because of the network

errors:
  - UserNotLoggedError (src/domain/entities/errors/auth/UserNotLogged.ts)
  - InvalidCredentialsError, EmailAlreadyInUseError, AutoLoginFailedError (errors/auth)
  - ApiBusinessError(message, statusCode), ConnectivityError (errors/api)
```

## Application

```yaml
use_cases:
  loginWithEmailUseCase:
    path: src/application/useCases/cases/auth/loginWithEmailUseCase.ts
    receives: { email, password }
    behavior: normalizes the email (trim + lowercase) and logs in.
  signUpWithEmailUseCase:
    path: src/application/useCases/cases/auth/signUpWithEmailUseCase.ts
    receives: { email, name, password }
    behavior: signs up, then logs in with the same credentials; a failing second step throws AutoLoginFailedError (the account exists).
  logoutUseCase:
    path: src/application/useCases/cases/auth/logoutUseCase.ts
    behavior: clears the token and all cache. No API call.

providers:
  UserProvider (src/application/providers/user/index.tsx):
    behavior: loads the profile via getUserUseCase (GET /v1/user/me). Subscribes to `onSessionExpired` and calls `resetFetcherData()` so `logged` becomes false and (app)/_layout redirects to /login.
```

## Data

```yaml
datasources:
  loginDatasource (src/data/datasource/data/auth/api):
    loginWithEmail: POST /v1/auth/login/email -> stores { token } with tokenStorage; 401 -> InvalidCredentialsError
    signUpWithEmail: POST /v1/auth/signup/email; 422 -> EmailAlreadyInUseError
    logout: tokenStorage.clearToken()
  userDatasource (src/data/datasource/data/user/api):
    getUser: GET /v1/user/me (no stored token -> UserNotLoggedError without calling the API)
    getUserById: GET /v1/user/:id (404 -> undefined)

models:
  UserModel: fromJSON/toJSON use the API shape (photoUrl optional -> avatarURL?)
```

`UserProfileEntity.photoUrl` / `UserDTO.photoUrl` are optional; the Family avatar falls back to a text avatar.

## Infrastructure

```yaml
wrappers:
  "@infrastructure/token":
    api: tokenStorage.{getToken,setToken,clearToken}
    storage: expo-secure-store on native, the storage wrapper (localStorage) on web. Only the raw JWT is stored.
  "@infrastructure/api":
    api: api.{get,post,patch,put,delete}("/v1/...")
    config: EXPO_PUBLIC_API_URL (includes /api), 15 s timeout, Bearer token auto-attached
    errors: network/timeout -> ConnectivityError; 400/422/other 4xx -> ApiBusinessError; 5xx/non-JSON -> GenericError (context has no body); 401 with token -> session expiry + UserNotLoggedError; 401 without token -> ApiBusinessError
    session: onSessionExpired(listener), hasSessionExpiredNotice(), clearSessionExpiredNotice(). Parallel 401s are handled once.
  "@infrastructure/fetcher":
    resetFetcherData(): queryClient.resetQueries()
```

## Presentation

```yaml
routes: /login (app/login.tsx), /signup (app/signup.tsx) — both public; a logged user is redirected to "/"
screens:
  Login: src/presentation/screens/Login (index.tsx View, hooks/useLoginViewModel.ts, utils/mapAuthError.ts)
  Signup: src/presentation/screens/Signup (index.tsx View, hooks/useSignupViewModel.ts)
validation: src/utils/authValidation.ts (returns i18n keys)
copy: i18n keys auth.*, login.*, signup.* (en-US + pt-BR)
```

Security notes: passwords are only sent in the request body, never stored, logged, put in breadcrumbs or in error context.
