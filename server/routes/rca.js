const express = require('express');
const router = express.Router();
const pool = require('../db');
const fs = require('fs');
const path = require('path');
const upload = require('../middleware/upload');

// --- RCA Reports (PDF) ---
router.get('/view-pdf/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/reports', req.params.filename);
  if (fs.existsSync(filePath)) { res.setHeader('Content-Type', 'application/octet-stream'); res.sendFile(filePath); } 
  else { res.status(404).json({ error: "File not found" }); }
});

router.get('/reports', async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, title, filename, TO_CHAR(upload_date, 'YYYY-MM-DD HH24:MI:SS') as "uploadDate" FROM rca_reports ORDER BY id DESC`);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/reports', upload.single('report'), async (req, res) => {
  try {
    const { title } = req.body;
    if (!req.file) return res.status(400).json({ error: "No PDF file provided." });
    const result = await pool.query('INSERT INTO rca_reports (title, filename) VALUES ($1, $2) RETURNING *', [title, req.file.filename]);
    res.status(201).json({ message: "Report uploaded successfully!", data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/reports/:id', upload.single('report'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const record = await pool.query('SELECT filename FROM rca_reports WHERE id = $1', [id]);
    if (record.rows.length === 0) return res.status(404).json({ error: "Report not found." });
    if (req.file) {
      const oldPath = path.join(__dirname, '../uploads/reports', record.rows[0].filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      const result = await pool.query('UPDATE rca_reports SET title = $1, filename = $2 WHERE id = $3 RETURNING *', [title, req.file.filename, id]);
      res.json({ message: "Report updated successfully!", data: result.rows[0] });
    } else {
      const result = await pool.query('UPDATE rca_reports SET title = $1 WHERE id = $2 RETURNING *', [title, id]);
      res.json({ message: "Title updated successfully!", data: result.rows[0] });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/reports/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await pool.query('SELECT filename FROM rca_reports WHERE id = $1', [id]);
    if (record.rows.length === 0) return res.status(404).json({ error: "Report not found." });
    const filePath = path.join(__dirname, '../uploads/reports', record.rows[0].filename);
    await pool.query('DELETE FROM rca_reports WHERE id = $1', [id]);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: "Report deleted successfully!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// --- RCA Videos (MP4) ---
router.get('/videos', async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, title, filename, TO_CHAR(upload_date, 'YYYY-MM-DD HH24:MI:SS') as "uploadDate" FROM rca_videos ORDER BY id DESC`);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/videos', upload.single('video'), async (req, res) => {
  try {
    const { title } = req.body;
    if (!req.file) return res.status(400).json({ error: "No video file provided." });
    const result = await pool.query('INSERT INTO rca_videos (title, filename) VALUES ($1, $2) RETURNING *', [title, req.file.filename]);
    res.status(201).json({ message: "Video uploaded successfully!", data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/videos/:id', upload.single('video'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const record = await pool.query('SELECT filename FROM rca_videos WHERE id = $1', [id]);
    if (record.rows.length === 0) return res.status(404).json({ error: "Video not found." });
    if (req.file) {
      const oldPath = path.join(__dirname, '../uploads/videos', record.rows[0].filename);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      const result = await pool.query('UPDATE rca_videos SET title = $1, filename = $2 WHERE id = $3 RETURNING *', [title, req.file.filename, id]);
      res.json({ message: "Video updated successfully!", data: result.rows[0] });
    } else {
      const result = await pool.query('UPDATE rca_videos SET title = $1 WHERE id = $2 RETURNING *', [title, id]);
      res.json({ message: "Title updated successfully!", data: result.rows[0] });
    }
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/videos/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await pool.query('SELECT filename FROM rca_videos WHERE id = $1', [id]);
    if (record.rows.length === 0) return res.status(404).json({ error: "Video not found." });
    const filePath = path.join(__dirname, '../uploads/videos', record.rows[0].filename);
    await pool.query('DELETE FROM rca_videos WHERE id = $1', [id]);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    res.json({ message: "Video deleted successfully!" });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;