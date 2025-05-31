import CategoryDTO from "@application/dto/financial/CategoryDTO";
import OwnerDTO from "@application/dto/user/OwnerDTO";

class CategoryViewModel {
  get icon() {
    return this.dto.icon;
  }

  get id() {
    return this.dto.id;
  }

  get level() {
    return this.dto.depthLevel;
  }

  get name() {
    return this.dto.name;
  }

  get owner() {
    return this.ownersDto.name;
  }

  get ownerId() {
    return this.ownersDto.id;
  }

  get ownerType() {
    return this.ownersDto.type;
  }

  constructor(
    private readonly dto: CategoryDTO,
    private readonly ownersDto: OwnerDTO,
  ) {}
}

export default CategoryViewModel;
