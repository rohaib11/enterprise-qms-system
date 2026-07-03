const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ==========================================
// STATIC FILE SERVING (Force Inline PDFs)
// ==========================================
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  setHeaders: function (res, filePath) {
    if (filePath.toLowerCase().endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + path.basename(filePath) + '"');
    }
  }
}));

// ==========================================
// IMPORT ROUTES
// ==========================================
const authRoutes = require('./routes/auth');
const pdiRoutes = require('./routes/pdi');
const rcaRoutes = require('./routes/rca');
const qaRoutes = require('./routes/qa');
const complaintRoutes = require('./routes/complaints');
const bigDataRoutes = require('./routes/bigdata');
const isoRoutes = require('./routes/iso');
const dpuRoutes = require('./routes/dpu'); // <--- I ADDED THIS FOR YOU

// ==========================================
// MOUNT ROUTES
// ==========================================
app.use('/api/auth', authRoutes);
app.use('/api/pdi', pdiRoutes);
app.use('/api/rca', rcaRoutes);
app.use('/api/qa', qaRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/bigdata', bigDataRoutes);
app.use('/api/iso', isoRoutes);
app.use('/api/dpu', dpuRoutes); // <--- I ADDED THIS FOR YOU

// --- START SERVER ---
app.listen(PORT, () => console.log(`🚀 Server running cleanly on http://localhost:${PORT}`));