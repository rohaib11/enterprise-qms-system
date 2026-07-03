const express = require('express');
const router = express.Router();
const pool = require('../db');
const fs = require('fs');
const path = require('path');
const upload = require('../middleware/upload');

// Stealth PDF viewer
router.get('/view-pdf/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/iso', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/octet-stream');
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// Get all records
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, title, filename, TO_CHAR(upload_date, 'YYYY-MM-DD HH24:MI:SS') as "uploadDate" 
       FROM iso_compliance_reports ORDER BY id DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upload new file
router.post('/', upload.single('iso_file'), async (req, res) => {
  try {
    const { title } = req.body;
    if (!req.file) return res.status(400).json({ error: "No PDF file provided." });
    const result = await pool.query(
      'INSERT INTO iso_compliance_reports (title, filename) VALUES ($1, $2) RETURNING *',
      [title, req.file.filename]
    );
    res.status(201).json({ message: "ISO document uploaded!", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update (with optional file replacement)
router.put('/:id', upload.single('iso_file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const current = await pool.query('SELECT filename FROM iso_compliance_reports WHERE id = $1', [id]);
    if (current.rows.length === 0) return res.status(404).json({ error: "Report not found." });

    let filename = current.rows[0].filename;

    if (req.file) {
      const oldPath = path.join(__dirname, '../uploads/iso', filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      filename = req.file.filename;
    }

    const result = await pool.query(
      'UPDATE iso_compliance_reports SET title = $1, filename = $2 WHERE id = $3 RETURNING *',
      [title, filename, id]
    );
    res.json({ message: "Document updated successfully!", data: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete record and file
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await pool.query('SELECT filename FROM iso_compliance_reports WHERE id = $1', [id]);
    if (record.rows.length === 0) return res.status(404).json({ error: "Report not found." });

    const filename = record.rows[0].filename;
    await pool.query('DELETE FROM iso_compliance_reports WHERE id = $1', [id]);

    const filePath = path.join(__dirname, '../uploads/iso', filename);
    if (filename && fs.existsSync(filePath)) fs.unlinkSync(filePath);

    res.json({ message: "Document deleted successfully!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;