export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="max-w-7xl mx-auto p-2">
      <h1>Product cards</h1>
      {children}
    </div>
  );
}
