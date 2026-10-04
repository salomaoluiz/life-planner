# Family Member Module Context

## Domain

```yaml
entities:
  FamilyMemberEntity:
    path: src/domain/entities/familyMember/FamilyMemberEntity.ts
    properties:
      - id: string
      - familyId: string
      - userId: string
      - role: string

interfaces:
  FamilyMemberRepository:
    path: src/domain/repositories/familyMember/familyMemberRepository.ts
    methods:
      - createFamilyMember(params: any): Promise<FamilyMemberEntity>
      - deleteFamilyMember(id: string): Promise<void>
      - getFamilyMembers(familyId: string): Promise<FamilyMemberEntity[]>
      - joinFamilyMember(params: any): Promise<void>
```

## Application

```yaml
use_cases:
  deleteFamilyMemberUseCase:
    path: src/application/useCases/cases/familyMember/deleteFamilyMemberUseCase.ts
    behavior: Removes a user from a family.

  inviteFamilyMemberUseCase:
    path: src/application/useCases/cases/familyMember/inviteFamilyMemberUseCase.ts
    behavior: Invites a new member to join the family.

  joinFamilyMemberUseCase:
    path: src/application/useCases/cases/familyMember/joinFamilyMemberUseCase.ts
    behavior: Processes an invitation for a user to join a family.

  getFamilyMembersUseCase:
    path: src/application/useCases/cases/familyMember/getFamilyMembersUseCase.ts
    behavior: Retrieves all members of a given family.

dtos:
  - name: FamilyMemberDTO
    path: src/application/dto/familyMember/FamilyMemberDTO.ts
```

## Infrastructure

```yaml
repositories:
  familyMemberRepositoryImpl:
    path: src/data/repositories/repos/familyMember/familyMemberRepositoryImpl.ts
    implements: FamilyMemberRepository

datasources:
  familyMemberDatasourceImpl:
    path: src/data/datasource/data/familyMember/supabase/familyMemberDatasourceImpl.ts
    connection: Supabase
```

## Presentation

```yaml
screens:
  - Shared with Family Screen

components:
  - name: AddNewFamilyMember
    path: src/presentation/screens/Family/components/AddNewFamilyMember/index.tsx

containers:
  - name: FamilyMemberCard
    path: src/presentation/screens/Family/containers/FamilyMemberCard/index.tsx

modals:
  - name: AddNewFamilyMember (Modal)
    path: src/presentation/screens/Family/modals/AddNewFamilyMember/index.tsx

view_models:
  - name: FamilyMembersViewModel
    path: src/presentation/screens/Family/models/FamilyMembersViewModel.ts
```
