import ProductsSection from "../components/ProductsSection";

export const revalidate = 60; // Revalidate every 60 seconds
const Products = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products`,
    {
      method: "GET",
      next: { revalidate: 60 }, // Ensure fresh data is fetched every time
    }
  );

  if (!response.ok) {
    console.error("Failed to fetch products:", response.statusText);
    throw new Error("Failed to fetch products");
  }

  const products = await response.json();

  console.log("products", products);
  return (
    <div className="max-w-7xl mx-auto p-2">
      <h1>Product cards</h1>
      <ProductsSection products={products} />
    </div>
  );
};

export default Products;
