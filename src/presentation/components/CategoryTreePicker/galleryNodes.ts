import { CATEGORY_COLORS } from "@presentation/constants/categoryColors";

import { TreeNode } from "./treeModel";

// Sample tree for the Dev ComponentGallery.
const GALLERY_TREE_NODES: TreeNode[] = [
  {
    color: CATEGORY_COLORS[0].value,
    icon: "cart-outline",
    id: "food",
    name: "Food",
  },
  {
    color: CATEGORY_COLORS[1].value,
    icon: "cart-outline",
    id: "market",
    name: "Market",
    parentId: "food",
  },
  {
    color: CATEGORY_COLORS[2].value,
    icon: "home-outline",
    id: "home",
    name: "Home",
  },
];

export default GALLERY_TREE_NODES;
