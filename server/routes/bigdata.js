const express = require('express');
const router = express.Router();
const pool = require('../db');
const fs = require('fs');
const path = require('path');
const upload = require('../middleware/upload');

// Stealth PDF viewer (unchanged)
router.get('/view-pdf/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/bigdata', req.params.filename);
  if (fs.existsSync(filePath)) { 
    res.setHeader('Content-Type', 'application/octet-stream'); 
    res.sendFile(filePath); 
  } else { 
    res.status(404).json({ error: "File not found" }); 
  }
});

// Get all records (unchanged)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, filename, TO_CHAR(upload_date, 'YYYY-MM-DD HH24:MI:SS') as "uploadDate" 
       FROM big_data_reports ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Upload new file (unchanged)
router.post('/', upload.single('bigdata_file'), async (req, res) => {
  try {
    const { title } = req.body;
    if (!req.file) return res.status(400).json({ error: "No PDF file provided." });
    const result = await pool.query(
      'INSERT INTO big_data_reports (title, filename) VALUES ($1, $2) RETURNING *',
      [title, req.file.filename]
    );
    res.status(201).json({ message: "Big Data Report uploaded!", data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- NEW: Update an existing report (with optional file replacement) ---
router.put('/:id', upload.single('bigdata_file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    // Fetch current record
    const current = await pool.query('SELECT filename FROM big_data_reports WHERE id = $1', [id]);
    if (current.rows.length === 0) {
      return res.status(404).json({ error: "Report not found." });
    }

    let filename = current.rows[0].filename;

    // If a new file was uploaded, replace the old one
    if (req.file) {
      // Remove old file
      const oldPath = path.join(__dirname, '../uploads/bigdata', filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

      filename = req.file.filename;
    }

    const result = await pool.query(
      'UPDATE big_data_reports SET title = $1, filename = $2 WHERE id = $3 RETURNING *',
      [title, filename, id]
    );

    res.json({ message: "Report updated successfully!", data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Delete file (unchanged, but added filename guard)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await pool.query('SELECT filename FROM big_data_reports WHERE id = $1', [id]);
    if (record.rows.length === 0) return res.status(404).json({ error: "Report not found." });
    
    const filename = record.rows[0].filename;
    await pool.query('DELETE FROM big_data_reports WHERE id = $1', [id]);

    // Delete physical file only if it exists
    const filePath = path.join(__dirname, '../uploads/bigdata', filename);
    if (filename && fs.existsSync(filePath)) fs.unlinkSync(filePath);
    
    res.json({ message: "Report deleted successfully!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;