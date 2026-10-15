# Auth Module Context

Email + password against the NestJS API (`../life-planner-back`). Google Sign-In and `supabase.auth.*` were removed (spec 002). Sessions (spec 027): login also returns a rotating refresh token; the app renews the access token on 401 and on app open, so a user who opens the app at least every 2 days stays logged in. Only when the refresh is refused (401: idle > 2 days, copied token, deleted user) the session-expired flow sends the user back to `/login`.

## Domain

```yaml
interfaces:
  LoginRepository:
    path: src/domain/repositories/auth/loginRepository.ts
    methods:
      - loginWithEmail(params: { email, password }): Promise<void> # stores the token and the refresh token
      - signUpWithEmail(params: { email, name, password }): Promise<void>
      - logout(): Promise<void> # clears both tokens locally; tells the API best effort; never fails because of the network

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
    behavior: clears both tokens and all cache; the datasource also calls POST /v1/auth/logout best effort (fire and forget).

providers:
  UserProvider (src/application/providers/user/index.tsx):
    behavior: loads the profile via getUserUseCase (GET /v1/user/me). Subscribes to `onSessionExpired` and calls `resetFetcherData()` so `logged` becomes false and (app)/_layout redirects to /login.
```

## Data

```yaml
datasources:
  loginDatasource (src/data/datasource/data/auth/api):
    loginWithEmail: POST /v1/auth/login/email (sends deviceName = platform) -> stores { token, refreshToken? } with tokenStorage (no refreshToken from an old API = behaves as before); 401 -> InvalidCredentialsError
    signUpWithEmail: POST /v1/auth/signup/email; 422 -> EmailAlreadyInUseError
    logout: reads the refresh token, tokenStorage.clearToken() (clears both), then POST /v1/auth/logout { refreshToken } ignoring any failure
  userDatasource (src/data/datasource/data/user/api):
    getUser: GET /v1/user/me (no stored token -> UserNotLoggedError without calling the API; calls refreshSessionIfNeeded() first, so opening the app renews an access token that expires within 5 minutes)
    getUserById: GET /v1/user/:id (404 -> undefined)

models:
  UserModel: fromJSON/toJSON use the API shape (photoUrl optional -> avatarURL?)
```

`UserProfileEntity.photoUrl` / `UserDTO.photoUrl` are optional; the Family avatar falls back to a text avatar.

## Infrastructure

```yaml
wrappers:
  "@infrastructure/token":
    api: tokenStorage.{getToken,setToken,getRefreshToken,setRefreshToken,clearToken} (clearToken clears both)
    storage: expo-secure-store on native (keys session_token, session_refresh_token), the storage wrapper (localStorage) on web. Only the raw tokens are stored.
  "@infrastructure/api":
    api: api.{get,post,patch,put,delete}("/v1/...")
    config: EXPO_PUBLIC_API_URL (includes /api), 15 s timeout, Bearer token auto-attached
    errors: network/timeout -> ConnectivityError; 400/422/other 4xx -> ApiBusinessError; 5xx/non-JSON -> GenericError (context has no body); 401 with token -> session expiry + UserNotLoggedError; 401 without token -> ApiBusinessError
    refresh: a 401 on an authenticated request calls POST /v1/auth/refresh once (single flight shared by parallel requests; a request whose token was already renewed does not call again), saves the new pair and retries the request once. Refresh 401 -> session expired flow; refresh offline/5xx -> the original request fails with that error and the tokens are kept. /v1/auth/* never refreshes. refreshSessionIfNeeded() (proactive, 5-minute window, decodes `exp` locally) runs in getUser and, through useRefreshOnForeground (AppState), when the app returns to the foreground.
    session: onSessionExpired(listener), hasSessionExpiredNotice(), clearSessionExpiredNotice(). Parallel 401s are handled once.
    accountDeleted: setAccountDeletedNotice(), hasAccountDeletedNotice(), clearAccountDeletedNotice() (spec 024; one-time notice on Login, consumed on mount).
    delete: api.delete(path, body?) accepts a JSON body.
  "@infrastructure/fetcher":
    resetFetcherData(): queryClient.resetQueries()
```

## Presentation

```yaml
routes: /login (app/login.tsx), /signup (app/signup.tsx) — both public; a logged user is redirected to "/"
screens:
  Login: src/presentation/screens/Login (testIds.ts, index.tsx View, hooks/useLoginViewModel.ts, utils/mapAuthError.ts)
  Signup: src/presentation/screens/Signup (testIds.ts, index.tsx View, hooks/useSignupViewModel.ts)
validation: src/utils/authValidation.ts (returns i18n keys)
copy: i18n keys auth.*, login.*, signup.* (en-US + pt-BR)
```

Security notes: passwords are only sent in the request body, never stored, logged, put in breadcrumbs or in error context.

testIDs: Login and Signup export their ids from `testIds.ts` (`<module>.<screen>.<element>`, e.g. `auth.login.email-input`); the View, its Jest tests and the Maestro flows in `e2e/` use the same strings.

## E2E

`e2e/flows/auth/stay-logged-in.yaml` (tags `auth`, `spec-027`): log in, relaunch without clearing state, Home is shown.

## Account deletion (spec 024)

```yaml
api: DELETE /v1/user/me with { email } -> 204; 422 -> AccountEmailMismatchError; 401 -> session-expired flow
domain: UserRepository.deleteAccount(email); AccountEmailMismatchError (errors/auth)
data: src/data/datasource/data/user/api/deleteAccount.ts, src/data/repositories/repos/user/deleteAccount.ts (errors never carry the email)
application: deleteAccountUseCase (user.delete_account_use_case) = userRepository.deleteAccount then loginRepository.logout() (local session cleanup); no logout when the delete fails
presentation: src/presentation/screens/Config/containers/DeleteAccount (index.tsx View, hooks/useDeleteAccountViewModel.ts, styles.ts), ids in Config/testIds.ts (settings.delete-account.*)
flow: Settings "Delete account" -> ConfirmDialog (names owned families) -> BottomSheet with email TextField (submit enabled when trimmed+lowercased email equals the user's) -> request; success = same cleanup as Logout + setAccountDeletedNotice + router.replace("/login")
login notice: auth.login.account-deleted-notice (i18n login.accountDeletedNotice)
```
