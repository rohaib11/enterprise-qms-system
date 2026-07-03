const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(`SELECT id, pdi_number AS "pdiNumber", TO_CHAR(date, 'YYYY-MM-DD') AS date, vin, model, exterior_color AS "exteriorColor", interior_color AS "interiorColor", category, inspection_details AS "inspectionDetails" FROM pdi_records ORDER BY id DESC`);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', async (req, res) => {
  try {
    const { pdiNumber, date, vin, model, exteriorColor, interiorColor, category, inspectionDetails } = req.body;
    if (!vin || vin.length !== 17) return res.status(400).json({ error: 'VIN must be exactly 17 characters.' });
    const duplicateCheck = await pool.query('SELECT id FROM pdi_records WHERE vin = $1', [vin]);
    if (duplicateCheck.rows.length > 0) return res.status(400).json({ error: 'This VIN already exists.' });
    const newRecord = await pool.query(`INSERT INTO pdi_records (pdi_number, date, vin, model, exterior_color, interior_color, category, inspection_details) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`, [pdiNumber, date, vin, model, exteriorColor, interiorColor, category, JSON.stringify(inspectionDetails)]);
    res.status(201).json({ message: 'PDI created successfully!', data: newRecord.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { model, vin, exteriorColor, interiorColor, category, inspectionDetails } = req.body;
    const updateQuery = await pool.query(`UPDATE pdi_records SET model = $1, vin = $2, exterior_color = $3, interior_color = $4, category = $5, inspection_details = $6 WHERE id = $7 RETURNING *`, [model, vin, exteriorColor, interiorColor, category, JSON.stringify(inspectionDetails), id]);
    if (updateQuery.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Record updated successfully!' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM pdi_records WHERE id = $1', [id]);
    res.json({ message: 'Record deleted successfully' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;