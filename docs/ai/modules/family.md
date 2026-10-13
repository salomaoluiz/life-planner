# Family Module Context

## Domain

```yaml
entities:
  FamilyEntity:
    path: src/domain/entities/family/FamilyEntity.ts
    properties:
      - id: string
      - name: string
      - ownerId: string

interfaces:
  FamilyRepository:
    path: src/domain/repositories/family/familyRepository.ts
    methods:
      - createFamily(params: CreateFamilyRepositoryParams): Promise<FamilyEntity>
      - deleteFamily(id: string): Promise<void>
      - getFamilies(userId: string): Promise<FamilyEntity[]>
      - getFamilyById(familyId: string): Promise<FamilyEntity>
      - updateFamily(params: UpdateFamilyRepositoryParams): Promise<void>

errors:
  - name: FamilyNotFound
    path: src/domain/entities/errors/family/FamilyNotFound.ts
  - name: FamilyNotCreated
    path: src/domain/entities/errors/family/FamilyNotCreated.ts
  - name: FamilyHasRecords
    path: src/domain/entities/errors/family/FamilyHasRecords.ts
    description: delete blocked, the family still owns stock/financial records (API 409)
```

## Application

```yaml
use_cases:
  createFamilyUseCase:
    path: src/application/useCases/cases/family/createFamilyUseCase.ts
    receives: CreateFamilyUseCaseParams
    returns: Promise<void>
    behavior: Creates a new family for the current user. The API creates the owner's membership atomically; the use case no longer calls familyMemberRepository.

  deleteFamilyUseCase:
    path: src/application/useCases/cases/family/deleteFamilyUseCase.ts
    receives: string (id)
    returns: Promise<void>
    behavior: Deletes a family by id.

  getFamiliesUseCase:
    path: src/application/useCases/cases/family/getFamiliesUseCase.ts
    receives: void
    returns: Promise<FamilyDTO[]>
    behavior: Retrieves all families for the current logged-in user.

  getFamilyByIdUseCase:
    path: src/application/useCases/cases/family/getFamilyByIdUseCase.ts
    receives: string (familyId)
    returns: Promise<FamilyDTO>
    behavior: Retrieves a specific family by its id.

  updateFamilyUseCase:
    path: src/application/useCases/cases/family/updateFamilyUseCase.ts
    receives: UpdateFamilyRepositoryParams
    returns: Promise<void>
    behavior: Updates the details of an existing family.

dtos:
  - name: FamilyDTO
    path: src/application/dto/family/FamilyDTO.ts
    description: Transforms FamilyEntity for presentation
```

## Infrastructure

```yaml
repositories:
  familyRepositoryImpl:
    path: src/data/repositories/repos/family/familyRepositoryImpl.ts
    implements: FamilyRepository
    dependencies: [FamilyDatasource]

datasources:
  FamilyDatasource:
    path: src/data/repositories/repos/family/familyDatasource.ts
    implementation: src/data/datasource/data/families/api/ (API datasource over @infrastructure/api; createFamily, deleteFamily, getFamilies, getFamilyById, updateFamily, familyApiError)
    error_mapping: 404 -> FamilyNotFound, 400 -> FieldInvalid, create without body -> FamilyNotCreated, delete 409 -> FamilyHasRecords, other -> GenericError
    methods:
      - createFamily(params: CreateFamilyDatasourceParams): Promise<FamilyModel>
      - deleteFamily(id: string): Promise<void>
      - getFamilies(userId: string): Promise<FamilyModel[]>
      - getFamilyById(familyId: string): Promise<FamilyModel>
      - updateFamily(params: UpdateFamilyDatasourceParams): Promise<void>
```

## Presentation

```yaml
screens:
  Family:
    path: src/presentation/screens/Family/index.tsx
    note: View; own ScreenHeader (new-family IconButton), list of cards, loading / error / empty states
hooks:
  - name: useFamilyViewModel
    path: src/presentation/screens/Family/hooks/useFamilyViewModel.ts
    note: expansion state (first family expanded, a newly created family expanded) and screen state
  - name: useFamilies
    path: src/presentation/screens/Family/hooks/useFamilies.ts
    note: families + members + current user (viewer)
containers:
  - name: FamilyCard
    path: src/presentation/screens/Family/containers/FamilyCard/index.tsx
    note: View + hooks/useFamilyCardViewModel (menu / confirm / notice state, delete family, leave, FamilyHasRecords notice)
components:
  - name: MemberRow
    path: src/presentation/screens/Family/components/MemberRow/index.tsx
  - name: ActionSheet
    path: src/presentation/screens/Family/components/ActionSheet/index.tsx
  - name: NoticeSheet
    path: src/presentation/screens/Family/components/NoticeSheet/index.tsx
modals:
  - name: AddNewFamily
    path: src/presentation/screens/Family/modals/AddNewFamily/index.tsx
    note: useAddNewFamilyViewModel, name 1-50 chars, counter from 40
  - name: AddNewFamilyMember
    path: src/presentation/screens/Family/modals/AddNewFamilyMember/index.tsx
    note: see familyMember.md
models:
  - name: FamilyViewModel
    path: src/presentation/screens/Family/models/FamilyViewModel.ts
  - name: FamilyMemberUIModel
    path: src/presentation/screens/Family/models/FamilyMemberUIModel.ts
  - name: FamilyConfirm
    path: src/presentation/screens/Family/models/FamilyConfirm.ts
utils:
  - src/presentation/screens/Family/utils/expansion.ts
  - src/presentation/screens/Family/utils/sortFamilies.ts
  - src/presentation/screens/Family/utils/inviteLink.ts
```

Notes:

- Expansion state lives in `useFamilyViewModel`; the owner/member action matrix lives in the UI models.
- After any destructive success (delete family, leave, remove member, cancel invite) `invalidateFetcherData()` refetches families, members and owners.
- The Family screen folder is out of the lint migration allow-list (spec 012): kit components only, no style typography/color keys.
