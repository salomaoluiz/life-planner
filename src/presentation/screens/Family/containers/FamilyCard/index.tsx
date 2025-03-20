import { router } from "expo-router";
import { useEffect } from "react";

import { useCases } from "@application/useCases";
import { DeleteFamilyUseCaseParams } from "@application/useCases/cases/family/deleteFamilyUseCase";
import { useMutation } from "@infrastructure/fetcher";
import * as Components from "@screens/Family/components";
import FamilyViewModel from "@screens/Family/models/FamilyViewModel";

interface Props {
  family: FamilyViewModel;
  refetchFamilies: () => void;
}

function FamilyCard(props: Props) {
  const deleteFamily = useMutation<DeleteFamilyUseCaseParams, void>({
    cacheKey: [useCases.deleteFamilyUseCase.uniqueName],
    fetch: useCases.deleteFamilyUseCase.execute,
  });

  useEffect(() => {
    if (deleteFamily.status === "success") {
      props.refetchFamilies();
    }
  }, [deleteFamily.status]);

  function onAddNewFamilyMember() {
    router.push({
      params: { familyId: props.family.familyId },
      pathname: "/(app)/family/add_new_family_member",
    });
  }

  async function onDeleteFamily() {
    deleteFamily.mutate({ id: props.family.familyId });
  }

  return (
    <>
      <Components.FamilyCard
        family={props.family}
        onAddNewFamilyMember={onAddNewFamilyMember}
        onDeleteFamily={onDeleteFamily}
        refetchFamilies={props.refetchFamilies}
      />
    </>
  );
}

export default FamilyCard;
