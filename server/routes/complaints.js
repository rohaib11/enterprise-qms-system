const express = require('express');
const router = express.Router();
const pool = require('../db');
const fs = require('fs');
const path = require('path');
const upload = require('../middleware/upload');

router.get('/view-media/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/complaints', req.params.filename);
  if (fs.existsSync(filePath)) {
    res.setHeader('Content-Type', 'application/octet-stream');
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "Media element not found" });
  }
});

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, complaint_no AS "complaintNo", dealership_name AS "dealershipName", TO_CHAR(date, 'YYYY-MM-DD') AS date, TO_CHAR(issue_date, 'YYYY-MM-DD') AS "issueDate", vin, colour, problem, found_during AS "foundDuring", solution_cause AS "solutionCause", vehicle_part_return AS "vehiclePartReturn", action_taken AS "actionTaken", TO_CHAR(rfd_date, 'YYYY-MM-DD') AS "rfdDate", liability, attachment_filename AS "attachmentFilename" FROM dealership_complaints ORDER BY id DESC`);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', upload.single('complaint_file'), async (req, res) => {
  try {
    const { complaintNo, dealershipName, date, issueDate, vin, colour, problem, foundDuring, solutionCause, vehiclePartReturn, actionTaken, rfdDate, liability } = req.body;
    if (!vin || vin.length !== 17) return res.status(400).json({ error: 'VIN must be exactly 17 characters.' });
    const attachmentFilename = req.file ? req.file.filename : null;
    const newComplaint = await pool.query(`INSERT INTO dealership_complaints (complaint_no, dealership_name, date, issue_date, vin, colour, problem, found_during, solution_cause, vehicle_part_return, action_taken, rfd_date, liability, attachment_filename) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) RETURNING *`, [complaintNo, dealershipName, date, issueDate || null, vin, colour, problem, foundDuring, solutionCause, vehiclePartReturn, actionTaken, rfdDate || null, liability, attachmentFilename]);
    res.status(201).json({ message: 'Complaint filed successfully!', data: newComplaint.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', upload.single('complaint_file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { dealershipName, date, issueDate, vin, colour, problem, foundDuring, solutionCause, vehiclePartReturn, actionTaken, rfdDate, liability } = req.body;
    const record = await pool.query('SELECT attachment_filename FROM dealership_complaints WHERE id = $1', [id]);
    if (record.rows.length === 0) return res.status(404).json({ error: "Complaint record not found." });
    let attachmentFilename = record.rows[0].attachment_filename;
    if (req.file) {
      if (attachmentFilename) {
        const oldPath = path.join(__dirname, '../uploads/complaints', attachmentFilename);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      attachmentFilename = req.file.filename;
    }
    const updateQuery = await pool.query(`UPDATE dealership_complaints SET dealership_name = $1, date = $2, issue_date = $3, vin = $4, colour = $5, problem = $6, found_during = $7, solution_cause = $8, vehicle_part_return = $9, action_taken = $10, rfd_date = $11, liability = $12, attachment_filename = $13 WHERE id = $14 RETURNING *`, [dealershipName, date, issueDate || null, vin, colour, problem, foundDuring, solutionCause, vehiclePartReturn, actionTaken, rfdDate || null, liability, attachmentFilename, id]);
    res.json({ message: 'Complaint record updated successfully!', data: updateQuery.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const record = await pool.query('SELECT attachment_filename FROM dealership_complaints WHERE id = $1', [id]);
    if (record.rows.length === 0) return res.status(404).json({ error: "Complaint entry not found." });
    const attachmentFilename = record.rows[0].attachment_filename;
    await pool.query('DELETE FROM dealership_complaints WHERE id = $1', [id]);
    if (attachmentFilename) {
      const filePath = path.join(__dirname, '../uploads/complaints', attachmentFilename);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }
    res.json({ message: 'Complaint deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;