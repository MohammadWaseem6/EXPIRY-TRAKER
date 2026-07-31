import ItemCard from "./ItemCard";

const ItemList = ({ items, handleDeleteItem }) => {
  if (items.length === 0) {
    return <p className="mt-4 text-gray-500 text-center">No items yet. Add one above!</p>;
  }

  return (
    <ul className="mt-4 space-y-3">
      {items.map((item) => (
        <li key={item._id}>
          <ItemCard item={item} onDelete={handleDeleteItem} />
        </li>
      ))}
    </ul>
  );
};

export default ItemList;  