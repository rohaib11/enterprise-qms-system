const multer = require('multer');
const fs = require('fs');

// ==========================================
// AUTO-SCAFFOLD DIRECTORIES
// ==========================================
const uploadDirs = [
  'uploads/reports', 
  'uploads/videos', 
  'uploads/qa/assembly', 
  'uploads/qa/paint',
  'uploads/complaints',
  'uploads/bigdata',
  'uploads/iso',     // ISO Compliance uploads
  'uploads/dpu'      // NEW: Assembly DPU Ratio uploads MUST be here!
];

// Create folders if they don't exist
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// ==========================================
// STORAGE CONFIGURATION
// ==========================================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === 'report') {
      cb(null, 'uploads/reports/');
    } else if (file.fieldname === 'video') {
      cb(null, 'uploads/videos/');
    } else if (file.fieldname === 'qa_assembly') {
      cb(null, 'uploads/qa/assembly/');
    } else if (file.fieldname === 'qa_paint') {
      cb(null, 'uploads/qa/paint/');
    } else if (file.fieldname === 'complaint_file') {
      cb(null, 'uploads/complaints/');
    } else if (file.fieldname === 'bigdata_file') {
      cb(null, 'uploads/bigdata/');
    } else if (file.fieldname === 'iso_file') {
      cb(null, 'uploads/iso/');   
    } else if (file.fieldname === 'dpu_file') {
      cb(null, 'uploads/dpu/');   // Multer will securely route DPU files here
    } else {
      cb(new Error('Invalid fieldname'));
    }
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '-');
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;