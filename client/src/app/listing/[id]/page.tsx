import { Suspense } from "react";
import ProductDetailsSkeleton from "./productSkeleton";
import ProductDetailsContent from "./productDetails";

type PageParamsProps = Promise<{
  id: string;
}>;

async function ProductDetailsPage({ params }: { params: PageParamsProps }) {
  return (
    <Suspense fallback={<ProductDetailsSkeleton />}>
      <ProductDetailsContent id={(await params).id} />
    </Suspense>
  );
}

export default ProductDetailsPage;
