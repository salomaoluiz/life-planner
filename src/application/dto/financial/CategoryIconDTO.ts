import { CategoryIconEntity } from "@domain/entities/financial/CategoryIconEntity";

class CategoryIconDTO {
  common: boolean;
  group: string;
  labelEn: string;
  labelPt: string;
  name: string;

  constructor(params: CategoryIconEntity) {
    this.common = params.common;
    this.group = params.group;
    this.labelEn = params.labelEn;
    this.labelPt = params.labelPt;
    this.name = params.name;
  }

  static fromEntity(entity: CategoryIconEntity) {
    return new CategoryIconDTO(entity);
  }
}

export default CategoryIconDTO;
