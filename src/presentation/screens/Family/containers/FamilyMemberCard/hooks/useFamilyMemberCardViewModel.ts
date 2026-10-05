import { useEffect, useState } from "react";

import { useCases } from "@application/useCases";
import { DeleteFamilyMemberUseCaseParams } from "@application/useCases/cases/familyMember/deleteFamilyMemberUseCase";
import { FamilyNotFound } from "@domain/entities/errors";
import { useMutation } from "@infrastructure/fetcher";
import FamilyMemberUIModel from "@screens/Family/models/FamilyMemberUIModel";

export interface Props {
  member: FamilyMemberUIModel;
  refetchFamily: () => void;
}

function useFamilyMemberCardViewModel(props: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const deleteMember = useMutation<DeleteFamilyMemberUseCaseParams, void>({
    cacheKey: [useCases.deleteFamilyMemberUseCase.uniqueName],
    fetch: useCases.deleteFamilyMemberUseCase.execute,
  });

  useEffect(() => {
    if (deleteMember.status === "success") {
      props.refetchFamily();
    }
  }, [deleteMember.status]);

  // Someone else already removed this member: the list is stale, reload it.
  useEffect(() => {
    if (deleteMember.error instanceof FamilyNotFound) {
      props.refetchFamily();
    }
  }, [deleteMember.error]);

  const canExpand = props.member.action !== undefined;

  function onActionPress() {
    deleteMember.mutate({ id: props.member.id });
  }

  function onToggle() {
    setIsExpanded((expanded) => !expanded);
  }

  return {
    actionLabelKey: props.member.actionLabelKey,
    avatar: props.member.legacyAvatar,
    canExpand,
    displayName: props.member.displayName,
    id: props.member.id,
    isDeleting: deleteMember.isFetching,
    isExpanded: canExpand && isExpanded,
    onActionPress,
    onToggle,
    statusLabelKey: props.member.statusLabelKey,
  };
}

export default useFamilyMemberCardViewModel;
