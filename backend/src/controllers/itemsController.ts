import { Request, Response } from 'express';
import database from '../config/database';
import { Item, CreateItemInput, UpdateItemInput } from '../models/item';

/**
 * Get all items
 */
export const getAllItems = async (_req: Request, res: Response): Promise<void> => {
  try {
    const items = await database.query<Item>(
      'SELECT * FROM items ORDER BY created_at DESC'
    );
    res.json(items);
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

/**
 * Get item by ID
 */
export const getItemById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const items = await database.query<Item>(
      'SELECT * FROM items WHERE id = $1',
      [id]
    );

    if (items.length === 0) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    res.json(items[0]);
  } catch (error) {
    console.error('Error fetching item:', error);
    res.status(500).json({ error: 'Failed to fetch item' });
  }
};

/**
 * Create new item
 */
export const createItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, completed = false }: CreateItemInput = req.body;

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      res.status(400).json({ error: 'Title is required and must be a non-empty string' });
      return;
    }

    if (!description || typeof description !== 'string') {
      res.status(400).json({ error: 'Description is required and must be a string' });
      return;
    }

    const items = await database.query<Item>(
      'INSERT INTO items (title, description, completed) VALUES ($1, $2, $3) RETURNING *',
      [title.trim(), description.trim(), completed]
    );

    res.status(201).json(items[0]);
  } catch (error) {
    console.error('Error creating item:', error);
    res.status(500).json({ error: 'Failed to create item' });
  }
};

/**
 * Update item
 */
export const updateItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates: UpdateItemInput = req.body;

    // Check if item exists
    const existingItems = await database.query<Item>(
      'SELECT * FROM items WHERE id = $1',
      [id]
    );

    if (existingItems.length === 0) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const values: unknown[] = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      if (typeof updates.title !== 'string' || updates.title.trim().length === 0) {
        res.status(400).json({ error: 'Title must be a non-empty string' });
        return;
      }
      updateFields.push(`title = $${paramCount++}`);
      values.push(updates.title.trim());
    }

    if (updates.description !== undefined) {
      if (typeof updates.description !== 'string') {
        res.status(400).json({ error: 'Description must be a string' });
        return;
      }
      updateFields.push(`description = $${paramCount++}`);
      values.push(updates.description.trim());
    }

    if (updates.completed !== undefined) {
      if (typeof updates.completed !== 'boolean') {
        res.status(400).json({ error: 'Completed must be a boolean' });
        return;
      }
      updateFields.push(`completed = $${paramCount++}`);
      values.push(updates.completed);
    }

    if (updateFields.length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }

    values.push(id);
    const query = `UPDATE items SET ${updateFields.join(', ')} WHERE id = $${paramCount} RETURNING *`;

    const items = await database.query<Item>(query, values);
    res.json(items[0]);
  } catch (error) {
    console.error('Error updating item:', error);
    res.status(500).json({ error: 'Failed to update item' });
  }
};

/**
 * Delete item
 */
export const deleteItem = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await database.query<Item>(
      'DELETE FROM items WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.length === 0) {
      res.status(404).json({ error: 'Item not found' });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ error: 'Failed to delete item' });
  }
};
