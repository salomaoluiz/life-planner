import { FlashList } from "@shopify/flash-list";

import useCategoryList from "@screens/Financial/Categories/containers/CategoriesList/useCategoryList";
import CategoryItem from "@screens/Financial/Categories/containers/CategoryItem";
import CategoryViewModel from "@screens/Financial/Categories/models/CategoryViewModel";

import Loading from "./components/Loading";

function CategoriesList() {
  const { data, refetch } = useCategoryList();

  if (!data) {
    return <Loading />;
  }

  function renderItem({ item }: { item: CategoryViewModel }) {
    return <CategoryItem category={item} refetch={refetch} />;
  }

  return (
    <FlashList
      data={data.categories}
      estimatedItemSize={data.categories.length + 1}
      renderItem={renderItem}
      showsVerticalScrollIndicator={false}
    />
  );
}

export default CategoriesList;
