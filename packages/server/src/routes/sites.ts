import { Router } from 'express';
import pool from '../config/database';

const router = Router();

// GET all sites
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, url, created_at, updated_at FROM sites ORDER BY created_at ASC'
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
});

// POST create new site
router.post('/', async (req, res) => {
  const { name, url } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL are required' });
  }

  // Normalize URL to ensure it has protocol
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

  try {
    const result = await pool.query(
      'INSERT INTO sites (name, url) VALUES ($1, $2) RETURNING id, name, url, created_at, updated_at',
      [name, normalizedUrl]
    );
    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    console.error('Error creating site:', error);
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Site with this URL already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create site' });
    }
  }
});

// PUT update site
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, url } = req.body;

  if (!name || !url) {
    return res.status(400).json({ error: 'Name and URL are required' });
  }

  // Normalize URL to ensure it has protocol
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;

  try {
    const result = await pool.query(
      'UPDATE sites SET name = $1, url = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, name, url, created_at, updated_at',
      [name, normalizedUrl, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }

    res.json(result.rows[0]);
  } catch (error: any) {
    console.error('Error updating site:', error);
    if (error.code === '23505') { // Unique violation
      res.status(409).json({ error: 'Site with this URL already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update site' });
    }
  }
});

// DELETE site
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query('DELETE FROM sites WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Site not found' });
    }

    res.json({ message: 'Site deleted successfully' });
  } catch (error) {
    console.error('Error deleting site:', error);
    res.status(500).json({ error: 'Failed to delete site' });
  }
});

export default router;
