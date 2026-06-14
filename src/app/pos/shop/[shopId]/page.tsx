export default function Shop({ params }: { params: { shopId: string } }) {
  return (
    <>
      <div>
        <h1>Shop {params.shopId}</h1>
      </div>
    </>
  );
}
