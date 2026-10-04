import { useState } from "react";

import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";
import { CreateCategoryUseCaseParams } from "@application/useCases/cases/financial/categories/createCategoryUseCase";
import { OwnerType } from "@domain/entities/user/OwnerEntity";

function useForm() {
  const [name, setName] = useState("");
  const [ownerId, setOwnerId] = useState<string | undefined>(undefined);
  const [parentId, setParentId] = useState<string | undefined>(undefined);
  const [icon, setIcon] = useState("folder");
  const [iconColor, setIconColor] = useState("black");
  const [type, setType] = useState("EXPENSE");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fields = {
    icon: { label: "Icon", onChange: setIcon, value: icon },
    iconColor: {
      label: "Icon Color",
      onChange: setIconColor,
      value: iconColor,
    },
    name: { label: "Name", onChange: setName, value: name },
    ownerId: { label: "Owner ID", onChange: setOwnerId, value: ownerId },
    parentId: {
      label: "Parent Category",
      onChange: setParentId,
      value: parentId,
    },
    type: { label: "Type", onChange: setType, value: type },
  };

  function validateForm(
    owners: OwnerDTO[],
    categories: CategoryDTO[],
  ): CreateCategoryUseCaseParams | undefined {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = "Name is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return undefined;
    }

    setErrors({});

    const selectedOwnerId = ownerId ?? owners[0]?.id;
    const selectedOwner = owners.find((o) => o.id === selectedOwnerId);
    const ownerType = selectedOwner?.type ?? OwnerType.USER;

    let depthLevel = 0;
    if (parentId) {
      const parent = categories.find((c) => c.id === parentId);
      if (parent) {
        depthLevel = (parent.depthLevel ?? 0) + 1;
      }
    }

    return {
      depthLevel,
      icon,
      iconColor,
      name,
      owner: ownerType,
      ownerId: selectedOwnerId,
      parentId: parentId && parentId !== "" ? parentId : undefined,
      type,
    };
  }

  return { errors, fields, validateForm };
}

export default useForm;
