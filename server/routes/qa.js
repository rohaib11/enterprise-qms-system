const express = require('express');
const router = express.Router();
const pool = require('../db');
const fs = require('fs');
const path = require('path');
const upload = require('../middleware/upload');

// --- QA Assembly ---
router.get('/assembly/view-pdf/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/qa/assembly', req.params.filename);
  if (fs.existsSync(filePath)) { res.setHeader('Content-Type', 'application/octet-stream'); res.sendFile(filePath); } 
  else { res.status(404).json({ error: "File not found" }); }
});

router.get('/assembly', async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, title, filename, TO_CHAR(upload_date, 'YYYY-MM-DD HH24:MI:SS') as "uploadDate" FROM qa_assembly_reports ORDER BY id DESC`);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/assembly', upload.single('qa_assembly'), async (req, res) => {
  try {
    const { title } = req.body;
    if (!req.file) return res.status(400).json({ error: "No PDF file provided." });
    const result = await pool.query('INSERT INTO qa_assembly_reports (title, filename) VALUES ($1, $2) RETURNING *', [title, req.file.filename]);
    res.status(201).json({ message: "Assembly Report uploaded!", data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/assembly/:id', upload.single('qa_assembly'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const record = await pool.query('SELECT filename FROM qa_assembly_reports WHERE id = $1', [id]);
    if (record.rows.length === 0) return res.status(404).json({ error: "Report not found." });
    if (req.file) {
      const oldPath = path.join(__dirname, '../uploads/qa/assembly', record.rows[0].filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      const result = await pool.query('UPDATE qa_assembly_reports SET title = $1, filename = $2 WHERE id = $3 RETURNING *', [title, req.file.filename, id]);
      res.json({ message: "Report updated successfully!", data: result.rows[0] });
    } else {
      const result = await pool.query('UPDATE qa_assembly_reports SET title = $1 WHERE id = $2 RETURNING *', [title, id]);
      res.json({ message: "Title updated successfully!", data: result.rows[0] });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/assembly/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await pool.query('SELECT filename FROM qa_assembly_reports WHERE id = $1', [id]);
    if (record.rows.length === 0) return res.status(404).json({ error: "Report not found." });
    const filePath = path.join(__dirname, '../uploads/qa/assembly', record.rows[0].filename);
    await pool.query('DELETE FROM qa_assembly_reports WHERE id = $1', [id]);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: "Report deleted successfully!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- QA Paint ---
router.get('/paint/view-pdf/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/qa/paint', req.params.filename);
  if (fs.existsSync(filePath)) { res.setHeader('Content-Type', 'application/octet-stream'); res.sendFile(filePath); } 
  else { res.status(404).json({ error: "File not found" }); }
});

router.get('/paint', async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, title, filename, TO_CHAR(upload_date, 'YYYY-MM-DD HH24:MI:SS') as "uploadDate" FROM qa_paint_reports ORDER BY id DESC`);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/paint', upload.single('qa_paint'), async (req, res) => {
  try {
    const { title } = req.body;
    if (!req.file) return res.status(400).json({ error: "No PDF file provided." });
    const result = await pool.query('INSERT INTO qa_paint_reports (title, filename) VALUES ($1, $2) RETURNING *', [title, req.file.filename]);
    res.status(201).json({ message: "Paint Report uploaded!", data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/paint/:id', upload.single('qa_paint'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const record = await pool.query('SELECT filename FROM qa_paint_reports WHERE id = $1', [id]);
    if (record.rows.length === 0) return res.status(404).json({ error: "Report not found." });
    if (req.file) {
      const oldPath = path.join(__dirname, '../uploads/qa/paint', record.rows[0].filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      const result = await pool.query('UPDATE qa_paint_reports SET title = $1, filename = $2 WHERE id = $3 RETURNING *', [title, req.file.filename, id]);
      res.json({ message: "Report updated successfully!", data: result.rows[0] });
    } else {
      const result = await pool.query('UPDATE qa_paint_reports SET title = $1 WHERE id = $2 RETURNING *', [title, id]);
      res.json({ message: "Title updated successfully!", data: result.rows[0] });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/paint/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await pool.query('SELECT filename FROM qa_paint_reports WHERE id = $1', [id]);
    if (record.rows.length === 0) return res.status(404).json({ error: "Report not found." });
    const filePath = path.join(__dirname, '../uploads/qa/paint', record.rows[0].filename);
    await pool.query('DELETE FROM qa_paint_reports WHERE id = $1', [id]);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: "Report deleted successfully!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;