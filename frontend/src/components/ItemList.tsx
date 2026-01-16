'use client';

import { useState } from 'react';
import { Item, updateItem, deleteItem } from '../lib/api';

interface ItemListProps {
  items: Item[];
  onItemsChange: () => void;
}

export default function ItemList({ items, onItemsChange }: ItemListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCompleted, setEditCompleted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleEdit = (item: Item) => {
    setEditingId(item.id);
    setEditTitle(item.title);
    setEditDescription(item.description);
    setEditCompleted(item.completed);
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDescription('');
    setEditCompleted(false);
    setError(null);
  };

  const handleUpdate = async (id: string) => {
    setError(null);
    setLoadingId(id);

    try {
      await updateItem(id, {
        title: editTitle,
        description: editDescription,
        completed: editCompleted,
      });
      setEditingId(null);
      onItemsChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setLoadingId(null);
    }
  };

  const handleToggleCompleted = async (item: Item) => {
    setError(null);
    setLoadingId(item.id);

    try {
      await updateItem(item.id, { completed: !item.completed });
      onItemsChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
    } finally {
      setLoadingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setError(null);
    setLoadingId(id);

    try {
      await deleteItem(id);
      onItemsChange();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
    } finally {
      setLoadingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="text-gray-400 mb-4">
          <svg
            className="w-24 h-24 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No items yet</h3>
        <p className="text-gray-500">Create your first item to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {items.map((item) => (
        <div
          key={item.id}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          {editingId === item.id ? (
            <div>
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-gray-900"
                />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-y min-h-[80px] text-gray-900"
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editCompleted}
                    onChange={(e) => setEditCompleted(e.target.checked)}
                    className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <span className="text-gray-700 font-medium">Completed</span>
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleUpdate(item.id)}
                  disabled={loadingId === item.id}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={loadingId === item.id}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-3 flex-1">
                  <button
                    onClick={() => handleToggleCompleted(item)}
                    disabled={loadingId === item.id}
                    className="mt-1"
                  >
                    <div
                      className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                        item.completed
                          ? 'bg-primary-600 border-primary-600'
                          : 'border-gray-300 hover:border-primary-400'
                      }`}
                    >
                      {item.completed && (
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </div>
                  </button>

                  <div className="flex-1">
                    <h3
                      className={`text-xl font-semibold mb-2 ${
                        item.completed ? 'line-through text-gray-500' : 'text-gray-800'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <p className="text-gray-600 mb-3">{item.description}</p>
                    <div className="flex gap-4 text-sm text-gray-500">
                      <span>Created: {new Date(item.created_at).toLocaleDateString()}</span>
                      <span>Updated: {new Date(item.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(item)}
                    disabled={loadingId === item.id}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={loadingId === item.id}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
