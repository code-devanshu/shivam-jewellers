export const dynamic = "force-dynamic";

import ProductForm from "../components/ProductForm";

const AddProductPage = async () => {
  async function fetchAllImageUrls(): Promise<string[]> {
    let cursor: string | undefined = undefined;
    const allImageUrls: string[] = [];

    try {
      do {
        const res = await fetch(
          `${process.env.BASE_URL}/api/cloudinary-images?cursor=${
            cursor || ""
          }`,
          { cache: "no-store" } // Avoid caching for fresh data
        );

        if (!res.ok) {
          throw new Error(`Failed to fetch images: ${res.statusText}`);
        }

        const data: {
          images: { secure_url: string }[];
          next_cursor?: string;
        } = await res.json();

        if (data.images) {
          allImageUrls.push(...data.images.map((image) => image.secure_url));
        }

        cursor = data.next_cursor;

        // Introduce a delay between requests
        if (cursor) {
          await new Promise((resolve) => setTimeout(resolve, 200)); // 200ms delay
        }
      } while (cursor);
    } catch (error) {
      console.error("Error fetching Cloudinary image URLs:", error);
    }

    return allImageUrls;
  }

  const imageUrls = await fetchAllImageUrls();

  console.log("imageUrls", imageUrls);

  return (
    <div className="max-w-6xl mx-auto mt-10">
      <ProductForm cloudinaryImages={imageUrls} />
    </div>
  );
};

export default AddProductPage;
