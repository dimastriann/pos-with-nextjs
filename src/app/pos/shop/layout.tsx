export default function ShoListLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <header className="bg-green-700 text-white p-3 text-center font-bold text-xl">
        Shops
      </header>
      {children}
    </div>
  );
}
