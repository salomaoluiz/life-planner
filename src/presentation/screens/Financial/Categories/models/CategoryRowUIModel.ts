import { normalizeCategoryColor } from "@presentation/constants/categoryColors";
import { CategoryTreeRow } from "@screens/Financial/models/categoryTree";

class CategoryRowUIModel {
  get color() {
    return normalizeCategoryColor(this.row.category.iconColor);
  }

  get depth() {
    return this.row.depth;
  }

  get hasChildren() {
    return this.row.childCount > 0;
  }

  get icon() {
    return this.row.category.icon;
  }

  get id() {
    return this.row.category.id;
  }

  get name() {
    return this.row.category.name;
  }

  get ownerId() {
    return this.row.category.ownerId;
  }

  // Only main categories show "N subcategories"; deeper rows have no subtitle.
  get subcount() {
    return this.row.depth === 0 ? this.row.childCount : 0;
  }

  constructor(private readonly row: CategoryTreeRow) {}
}

export default CategoryRowUIModel;
