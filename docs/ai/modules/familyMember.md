# Family Member Module Context

Family members, invites and joining run on the NestJS API (spec 004). There is no Supabase code in this module.

## Domain

```yaml
entities:
  FamilyMemberEntity:
    path: src/domain/entities/familyMember/FamilyMemberEntity.ts
    properties:
      - id, familyId, email: string
      - userId?: string
      - joinedAt?: Date
      - role: FamilyMemberRole (MEMBER | OWNER, derived by the API)
      - status: FamilyMemberStatus (JOINED | PENDING, derived by the API)
      - inviteExpired: boolean
      - name?, photoUrl?: string (from the API's user summary; never a per-member user call)
  FamilyInviteEntity:
    path: src/domain/entities/familyMember/FamilyInviteEntity.ts
    properties: [email, emailMatches, familyId, familyName, inviteExpiresAt]

enums:
  path: src/domain/entities/familyMember/FamilyMemberEnums.ts

helpers:
  isValidInviteToken: src/domain/entities/familyMember/inviteToken.ts   # 43 base64url chars

interfaces:
  FamilyMemberRepository:
    path: src/domain/repositories/familyMember/familyMemberRepository.ts
    methods:
      - deleteFamilyMember(id): Promise<void>
      - getFamilyMembers(familyId): Promise<FamilyMemberEntity[]>
      - getInvite(inviteToken): Promise<FamilyInviteEntity>
      - inviteFamilyMember({ email, familyId }): Promise<{ inviteExpiresAt: Date; inviteToken: string }>
      - joinFamilyMember({ inviteToken }): Promise<void>

errors: src/domain/entities/errors/familyMember (FamilyMemberAlreadyExists, InviteEmailMismatch, InviteExpired, InviteNotFound)
```

## Application

```yaml
use_cases:
  deleteFamilyMemberUseCase: remove a member, cancel a pending invite, or leave (the API decides by role).
  getFamilyMembersUseCase: members of a family (name/photo included).
  getFamilyInviteUseCase: preview an invite by token (family name, invited email, expiry, emailMatches). Rejects malformed tokens locally with InviteNotFound.
  inviteFamilyMemberUseCase: trims the email, asks the API for an invite, returns { inviteToken, inviteExpiresAt }.
  joinFamilyMemberUseCase: accept an invite; sends only the token (user and joinedAt come from the JWT / server time).

dtos: [FamilyMemberDTO, FamilyInviteDTO] # src/application/dto/familyMember
```

## Data

```yaml
datasource: src/data/datasource/data/familyMember/api # one file per method, shared client @infrastructure/api
endpoints:
  getFamilyMembers: GET /v1/families/:familyId/members
  inviteFamilyMember: POST /v1/families/:familyId/members { email }
  deleteFamilyMember: DELETE /v1/family-members/:memberId
  getInvite: GET /v1/family-invites/:token
  joinFamilyMember: POST /v1/family-invites/:token/accept (no body)
error_mapping:
  inviteFamilyMember: 400 FieldInvalid, 404 FamilyNotFound, 409 FamilyMemberAlreadyExists
  getFamilyMembers: 404 FamilyNotFound
  deleteFamilyMember: 404 FamilyNotFound
  getInvite: 400|404 InviteNotFound, 410 InviteExpired
  joinFamilyMember: 400|404 InviteNotFound, 403 InviteEmailMismatch, 409 FamilyMemberAlreadyExists, 410 InviteExpired
  other: GenericError (UserNotLoggedError / ConnectivityError re-thrown)
models: [FamilyMemberModel, FamilyInviteModel] # API JSON, camelCase
repository: src/data/repositories/repos/familyMember # CACHE_FAMILY_MEMBERS_DATA per family; invalidated on invite/delete/join
```

## Presentation

```yaml
family_screen:
  - hooks/useFamilies.ts: families + members + current user (getUserUseCase)
  - models/FamilyMemberUIModel.ts: action matrix (REMOVE / CANCEL_INVITE / none), status label keys, isCurrentUser / isOwner
  - components/MemberRow: member row with owner/pending badges and row actions
add_member_modal:
  - modals/AddNewFamilyMember (View + hooks/useAddNewFamilyMemberViewModel): email validation, inline 409 under the field, result state in the same sheet (link built from the token; `Copy link` -> `Copied` for 2 s via @infrastructure/clipboard; `Share...` via @infrastructure/share where available; `Done` refetches)
invite_screen:
  - screens/Invite (+ hooks/useInviteViewModel, models/InviteUIModel): centered 480 layout; loading / ready / mismatch / notFound / expired / accept errors
```

Infrastructure: `@infrastructure/clipboard` (`copyText`), `@infrastructure/share` (`isShareAvailable`, `shareText`).

## Security notes

- The invite token is a secret: never in cache keys, mutation variables, error contexts or logs (the API client redacts `/family-invites/<token>`).
- Link format: `${EXPO_PUBLIC_PROJECT_WEBSITE_URL}/invite?token=<token>`; the app builds the URL, the API only returns the token.
- `@infrastructure/crypto` is still used by `BusinessFeedback` (feedback route encoding), not by invites.
