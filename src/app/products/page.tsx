import ProductsSection from "../components/ProductsSection";

const Products = async () => {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_BASE_URL}/api/products`,
    {
      method: "GET",
      cache: "no-store", // Ensure fresh data is fetched every time
    }
  );

  if (!response.ok) {
    console.error("Failed to fetch products:", response.statusText);
    throw new Error("Failed to fetch products");
  }

  const products = await response.json();
  return (
    <div className="max-w-7xl mx-auto p-2">
      <h1>Product cards</h1>
      <ProductsSection products={products} />
    </div>
  );
};

export default Products;
