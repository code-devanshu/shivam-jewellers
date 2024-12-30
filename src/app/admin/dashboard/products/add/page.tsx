import ProductForm from "../components/ProductForm";

const AddProductPage = async () => {
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
    <div className="max-w-6xl mx-auto mt-10">
      <ProductForm cloudinaryImages={cloudinary} />
    </div>
  );
};
export default AddProductPage;
