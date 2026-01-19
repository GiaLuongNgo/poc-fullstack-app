export interface Item {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateItemInput {
  title: string;
  description: string;
  completed?: boolean;
}

export interface UpdateItemInput {
  title?: string;
  description?: string;
  completed?: boolean;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Fetch all items
 */
export async function getAllItems(): Promise<Item[]> {
  const response = await fetch(`${API_URL}/api/items`);
  if (!response.ok) {
    throw new Error('Failed to fetch items');
  }
  return response.json();
}

/**
 * Fetch item by ID
 */
export async function getItemById(id: string): Promise<Item> {
  const response = await fetch(`${API_URL}/api/items/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch item');
  }
  return response.json();
}

/**
 * Create new item
 */
export async function createItem(input: CreateItemInput): Promise<Item> {
  const response = await fetch(`${API_URL}/api/items`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create item');
  }
  
  return response.json();
}

/**
 * Update item
 */
export async function updateItem(id: string, input: UpdateItemInput): Promise<Item> {
  const response = await fetch(`${API_URL}/api/items/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(input),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update item');
  }
  
  return response.json();
}

/**
 * Delete item
 */
export async function deleteItem(id: string): Promise<void> {
  const response = await fetch(`${API_URL}/api/items/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete item');
  }
}
