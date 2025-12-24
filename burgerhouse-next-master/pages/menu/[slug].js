import Categories from "@/components/templates/menu/Categories";
import MenuItems from "@/components/templates/menu/MenuItems";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import getAllCategory, {
  getCategoryBySlug,
} from "@/components/services/categoryService";
import useCategories from "@/components/hooks/useCategories";
import Loading from "@/components/modules/Loading";
import toast from "react-hot-toast";
import useItems from "@/components/hooks/useItems";
import { useRouter } from "next/router";
import useCategoryItemsBySlug from "@/components/hooks/useCategoryItemsBySlug";
import { useEffect, useRef } from "react";
import StartDineInSession from "@/components/services/DineInService";
import useStartDineInSession from "@/components/features/dineIn/useStartDineInSession";

function MenuCategoryItems() {
  const router = useRouter();
  const { slug, tt } = router.query;
  const { categories } = useCategories();
  const { categories: categoryItemsBySlug } = useCategoryItemsBySlug(slug);
  const { dineInSession } = useStartDineInSession();
  const items = categoryItemsBySlug?.items || [];
  const hasSent = useRef(false);

  useEffect(() => {
    if (tt && !hasSent.current) {
      hasSent.current = true; // prevent duplicate firing
      dineInSession({ tt });
    }
  }, [tt]);

  return (
    <div
      className="bg-cover bg-center bg-[#505050e6] bg-blend-multiply pt-20 min-h-screen py-6"
      style={{
        backgroundImage: "url(/image/deliciousMeal.jpg)",
      }}
    >
      <Categories categories={categories} />
      <MenuItems items={items} />
    </div>
  );
}
export async function getStaticPaths() {
  const categories = await getAllCategory();

  const paths = categories.map((category) => {
    return { params: { slug: category.slug } };
  });

  return {
    paths,
    fallback: "blocking",
  };
}
export async function getStaticProps({ params }) {
  const { slug } = params;
  const queryClient = new QueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["categories"],
    queryFn: getAllCategory,
  });

  await queryClient.prefetchQuery({
    queryKey: ["categoryItemsBySlug", slug],
    queryFn: () => getCategoryBySlug(slug),
  });

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
    revalidate: 24 * 60 * 60, //60 * 60
  };
}

export default MenuCategoryItems;
