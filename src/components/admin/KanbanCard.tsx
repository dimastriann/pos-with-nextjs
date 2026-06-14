import { PosShop } from '@/models/PosModels';

interface KanbanCardProps {
  item: PosShop;
  onEdit: (item: PosShop) => void;
  onDelete: (id: string) => void;
}

export function KanbanCard({ item, onEdit, onDelete }: KanbanCardProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative group">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}
        >
          {item.active ? 'Active' : 'Inactive'}
        </span>
      </div>
      <p className="text-gray-500 text-sm mb-4 line-clamp-2">
        {item.address || 'No address provided'}
      </p>

      <div className="flex justify-end gap-2 mt-auto border-t pt-3">
        <button
          onClick={() => onEdit(item)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(item.id)}
          className="text-red-500 hover:text-red-700 text-sm font-medium"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
