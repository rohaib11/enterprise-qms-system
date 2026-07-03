const express = require('express');
const router = express.Router();
const pool = require('../db');
const fs = require('fs');
const path = require('path');
const upload = require('../middleware/upload');

// Smart Table Dictionary mapping URL params to SQL schemas
const getLineConfig = (line) => {
  const map = {
    'weld': { table: 'dpu_weld', dbCol: 'weld_no', reqCol: 'weldNo' },
    'paint-qg2': { table: 'dpu_paint_qg2', dbCol: 'paint_qg2_no', reqCol: 'paintQg2No' },
    'trim-line': { table: 'dpu_trim_line', dbCol: 'trim_line_no', reqCol: 'trimLineNo' },
    'chassis-line': { table: 'dpu_chassis_line', dbCol: 'chassis_line_no', reqCol: 'chassisLineNo' },
    'final-line': { table: 'dpu_final_line', dbCol: 'final_line_no', reqCol: 'finalLineNo' },
    'rework': { table: 'dpu_rework', dbCol: 'rework_no', reqCol: 'reworkNo' }
  };
  return map[line];
};

// 1. FIXED: Stealth PDF Viewer forcing inline rendering
router.get('/:line/view-pdf/:filename', (req, res) => {
  const filePath = path.join(__dirname, '../uploads/dpu', req.params.filename);
  if (fs.existsSync(filePath)) {
    // CHANGE: Switch from octet-stream to application/pdf inline disposition
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="' + path.basename(filePath) + '"');
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: "File not found" });
  }
});

// 2. Fetch Data
router.get('/:line', async (req, res) => {
  const config = getLineConfig(req.params.line);
  if (!config) return res.status(400).json({ error: "Invalid DPU line" });

  try {
    const result = await pool.query(`
      SELECT id, ${config.dbCol} AS "${config.reqCol}", TO_CHAR(date, 'YYYY-MM-DD') as date, 
      total_vehicles AS "totalVehicles", cumulative, ratio, attachment_filename AS "attachmentFilename"
      FROM ${config.table} ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 3. Create Record
router.post('/:line', upload.single('dpu_file'), async (req, res) => {
  const config = getLineConfig(req.params.line);
  if (!config) return res.status(400).json({ error: "Invalid DPU line" });

  try {
    const dpuNo = req.body[config.reqCol]; 
    const { date, totalVehicles, cumulative, ratio } = req.body;
    const attachmentFilename = req.file ? req.file.filename : null;

    const result = await pool.query(
      `INSERT INTO ${config.table} (${config.dbCol}, date, total_vehicles, cumulative, ratio, attachment_filename) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [dpuNo, date, totalVehicles, cumulative, ratio, attachmentFilename]
    );
    res.status(201).json({ message: "Record uploaded!", data: result.rows[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// 4. Edit/Overwrite Record
router.put('/:line/:id', upload.single('dpu_file'), async (req, res) => {
   const config = getLineConfig(req.params.line);
   if (!config) return res.status(400).json({ error: "Invalid DPU line" });

   try {
       const { id } = req.params;
       const { date, totalVehicles, cumulative, ratio } = req.body;

       const record = await pool.query(`SELECT attachment_filename FROM ${config.table} WHERE id = $1`, [id]);
       if (record.rows.length === 0) return res.status(404).json({ error: "Record not found." });

       let attachmentFilename = record.rows[0].attachment_filename;

       if (req.file) {
           if (attachmentFilename) {
               const oldPath = path.join(__dirname, '../uploads/dpu', attachmentFilename);
               if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
           }
           attachmentFilename = req.file.filename;
       }

       const result = await pool.query(
         `UPDATE ${config.table} SET date = $1, total_vehicles = $2, cumulative = $3, ratio = $4, attachment_filename = $5 WHERE id = $6 RETURNING *`,
         [date, totalVehicles, cumulative, ratio, attachmentFilename, id]
       );
       res.json({ message: "Record updated!", data: result.rows[0] });
   } catch (err) { res.status(500).json({ error: err.message }); }
});

// 5. Delete Record
router.delete('/:line/:id', async (req, res) => {
   const config = getLineConfig(req.params.line);
   if (!config) return res.status(400).json({ error: "Invalid DPU line" });

   try {
      const { id } = req.params;
      const record = await pool.query(`SELECT attachment_filename FROM ${config.table} WHERE id = $1`, [id]);
      if (record.rows.length === 0) return res.status(404).json({ error: "Record not found." });

      const attachmentFilename = record.rows[0].attachment_filename;
      await pool.query(`DELETE FROM ${config.table} WHERE id = $1`, [id]);

      if (attachmentFilename) {
         const filePath = path.join(__dirname, '../uploads/dpu', attachmentFilename);
         if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
      res.json({ message: "Record deleted!" });
   } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;