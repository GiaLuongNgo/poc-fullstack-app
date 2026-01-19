'use client';

import { useState, useEffect } from 'react';
import ItemList from '../components/ItemList';
import ItemForm from '../components/ItemForm';
import { getAllItems, createItem, Item, CreateItemInput } from '../lib/api';

export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setError(null);
      const data = await getAllItems();
      setItems(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load items');
      console.error('Failed to fetch items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreateItem = async (input: CreateItemInput) => {
    await createItem(input);
    await fetchItems();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Loading items...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button
            onClick={fetchItems}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Items Management</h2>
        <p className="text-gray-600">
          Create, update, and manage your items. This is a full-stack proof-of-concept application.
        </p>
      </div>

      <ItemForm onSubmit={handleCreateItem} />

      <div className="mb-4">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">
          All Items ({items.length})
        </h3>
      </div>

      <ItemList items={items} onItemsChange={fetchItems} />
    </div>
  );
}
