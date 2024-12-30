import { prisma } from "@/lib/prisma";
import ProductForm from "../../components/ProductForm";

const EditProductPage = async ({ params }: { params: { id: string } }) => {
  const product = (await prisma.product.findUnique({
    where: { id: params.id },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  })) as unknown as any;

  const cloudinary = await fetchAllImages();

  async function fetchAllImages() {
    let cursor = undefined;
    const allImages = [];

    do {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res: any = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/cloudinary-images?cursor=${
          cursor || ""
        }`
      );

      const data = await res.json();

      if (data.images) {
        allImages.push(...data.images);
      }

      cursor = data.next_cursor;
    } while (cursor); // Continue fetching until there's no next cursor

    return allImages;
  }

  return (
    <>
      <h1 className="text-center text-2xl font-semibold mb-6">Edit Product</h1>
      <ProductForm
        defaultValues={product}
        cloudinaryImages={cloudinary}
        productId={params.id}
      />
    </>
  );
};

export default EditProductPage;
