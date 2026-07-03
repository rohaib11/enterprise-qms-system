# 🏭 Enterprise Quality Management System (QMS)

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)

A robust, full-stack Quality Management dashboard engineered for **SAZGAR Engineering Works**. This system digitalises quality gate inspections, automates defect tracking, and provides a centralised hub for ISO compliance, Root Cause Analysis (RCA), and dealership complaint management.

---

## ✨ Key Features

* **📊 Live PDI Dashboard** – Real-time analytics for Pre-Delivery Inspection: total vehicles, V1/V2/V3 defect counts, defect ratio, and exportable reports (Excel & PDF).
* **📋 Comprehensive PDI Engine** – Create, edit, view, and delete inspection records with dynamic defect checklists and quick-fill personnel feature.
* **🛡️ Stealth PDF Viewer (IDM Bypass)** – Custom document viewer that loads PDFs as Base64/blobs in the browser, bypassing download managers like IDM and displaying files inline.
* **📈 Assembly DPU Ratio Modules** – Production analytics tracker with dedicated database synchronization for **Weld, Paint QG2, Trim-Line, Chassis-Line, Final-Line, and Rework** sectors.
* **📦 Document Repositories** – Separate upload, view, update, and delete modules for:
  * **RCA Reports** (PDFs)
  * **RCA Videos** (MP4/MOV)
  * **QA Assembly Reports** (PDFs)
  * **QA Paint Reports** (PDFs)
  * **Big Data Library** (Analytical datasets, PDFs)
  * **ISO Compliance** (Audit & certification documents, PDFs)
* **🚗 Dealership Complaint Tracking** – Full complaint lifecycle: create with file attachment, view details (including embedded media), quick-edit status/liability, and delete.
* **🔐 Secure File Handling** – Backend `Multer` storage with auto-scaffolding directories and strict field-name validation. JWT authentication for all API routes (frontend ready; middleware pending).
* **🎨 Enterprise UI/UX** – Collapsible sidebar, breadcrumb navigation, responsive design, toast notifications, and consistent modern styling.

---
## 📸 System Screenshots

### 1. Live Telemetry Dashboard
<img width="1900" height="863" alt="image" src="https://github.com/user-attachments/assets/a748a399-0a78-4bdf-bd31-39562fa95644" />

*Real-time First Time Through (FTT) metrics, defect severity distribution, and dealership complaint tracking.*

### 2. PDI Tab Form 
<img width="1871" height="827" alt="image" src="https://github.com/user-attachments/assets/1c503899-9486-4bc6-8fe2-cf4b8bc80787" />



### 3. Stealth PDF Viewer
<img width="1590" height="863" alt="image" src="https://github.com/user-attachments/assets/e068142f-c114-40ca-b471-009df02c3771" />


*Secure inline document rendering (Base64 Data URI) bypassing external download managers.*
## 💻 Tech Stack

**Frontend (Client)**
* React.js (Vite)
* Tailwind CSS
* SheetJS (Excel export)
* jsPDF + jspdf-autotable (PDF generation)
* React Router (via custom `Layout` component)

**Backend (Server)**
* Node.js & Express.js
* PostgreSQL (Database)
* Multer (File upload management)
* JSON Web Tokens (Authentication)

---

## 📂 Project Structure

```text
enterprise-qms-system/
├── client/
│   ├── src/
│   │   ├── components/       # Layout, shared charts components
│   │   │   └── charts/       # DefectTrendChart, DPUTrendChart, ParetoChart
│   │   ├── pages/            # All feature pages
│   │   │   ├── PDIList.jsx
│   │   │   ├── PDIForm.jsx
│   │   │   ├── DailyReport.jsx
│   │   │   ├── RCAReports.jsx
│   │   │   ├── RCAVideos.jsx
│   │   │   ├── QAAssembly.jsx
│   │   │   ├── QAPaint.jsx
│   │   │   ├── ComplaintView.jsx
│   │   │   ├── ComplaintForm.jsx
│   │   │   ├── BigDataLibrary.jsx
│   │   │   ├── IsoCompliance.jsx
│   │   │   ├── DPUWeld.jsx
│   │   │   ├── DPUPaintQG2.jsx
│   │   │   ├── DPUTrimLine.jsx
│   │   │   ├── DPUChassisLine.jsx
│   │   │   ├── DPUFinalLine.jsx
│   │   │   ├── DPURework.jsx
│   │   │   └── PlaceholderPage.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── server/
│   ├── routes/
│   │   ├── auth.js
│   │   ├── pdi.js
│   │   ├── rca.js
│   │   ├── qa.js
│   │   ├── complaints.js
│   │   ├── bigdata.js
│   │   ├── dpu.js            # Unified dynamic DPU routing engine
│   │   └── iso.js
│   ├── middleware/
│   │   └── upload.js         # Multer configuration & scaffolding directory array
│   ├── db.js
│   ├── index.js
│   └── .env (not committed)
└── README.md
```
## 🗄️ Database Setup

Run the following SQL in your **sazgar_qms** database to create all required tables:

```sql
-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),            -- ⚠️ Plain text; should be hashed with bcrypt in production
    role VARCHAR(50),
    security_question TEXT,
    security_answer TEXT,
    backup_key VARCHAR(16)
);

-- PDI Records
CREATE TABLE pdi_records (
    id SERIAL PRIMARY KEY,
    pdi_number VARCHAR(100) UNIQUE,
    date DATE,
    vin VARCHAR(17),
    model VARCHAR(100),
    exterior_color VARCHAR(100),
    interior_color VARCHAR(100),
    category VARCHAR(50),
    inspection_details JSONB
);

-- RCA Reports
CREATE TABLE rca_reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- RCA Videos
CREATE TABLE rca_videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QA Assembly Reports
CREATE TABLE qa_assembly_reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- QA Paint Reports
CREATE TABLE qa_paint_reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dealership Complaints
CREATE TABLE dealership_complaints (
    id SERIAL PRIMARY KEY,
    complaint_no VARCHAR(100) UNIQUE NOT NULL,
    dealership_name VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    issue_date DATE,
    vin VARCHAR(17) NOT NULL,
    colour VARCHAR(100),
    problem TEXT,
    found_during VARCHAR(255),
    solution_cause TEXT,
    vehicle_part_return VARCHAR(100),
    action_taken TEXT,
    rfd_date DATE,
    liability VARCHAR(100),
    attachment_filename VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Big Data Reports
CREATE TABLE big_data_reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ISO Compliance Documents
CREATE TABLE iso_compliance_reports (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ASSEMBLY DPU LINE SCHEMAS
CREATE TABLE dpu_weld ( id SERIAL PRIMARY KEY, weld_no VARCHAR(100) UNIQUE NOT NULL, date DATE NOT NULL, total_vehicles INTEGER NOT NULL, cumulative INTEGER NOT NULL, ratio NUMERIC(10, 4) NOT NULL, attachment_filename VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );
CREATE TABLE dpu_paint_qg2 ( id SERIAL PRIMARY KEY, paint_qg2_no VARCHAR(100) UNIQUE NOT NULL, date DATE NOT NULL, total_vehicles INTEGER NOT NULL, cumulative INTEGER NOT NULL, ratio NUMERIC(10, 4) NOT NULL, attachment_filename VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );
CREATE TABLE dpu_trim_line ( id SERIAL PRIMARY KEY, trim_line_no VARCHAR(100) UNIQUE NOT NULL, date DATE NOT NULL, total_vehicles INTEGER NOT NULL, cumulative INTEGER NOT NULL, ratio NUMERIC(10, 4) NOT NULL, attachment_filename VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );
CREATE TABLE dpu_chassis_line ( id SERIAL PRIMARY KEY, chassis_line_no VARCHAR(100) UNIQUE NOT NULL, date DATE NOT NULL, total_vehicles INTEGER NOT NULL, cumulative INTEGER NOT NULL, ratio NUMERIC(10, 4) NOT NULL, attachment_filename VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );
CREATE TABLE dpu_final_line ( id SERIAL PRIMARY KEY, final_line_no VARCHAR(100) UNIQUE NOT NULL, date DATE NOT NULL, total_vehicles INTEGER NOT NULL, cumulative INTEGER NOT NULL, ratio NUMERIC(10, 4) NOT NULL, attachment_filename VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );
CREATE TABLE dpu_rework ( id SERIAL PRIMARY KEY, rework_no VARCHAR(100) UNIQUE NOT NULL, date DATE NOT NULL, total_vehicles INTEGER NOT NULL, cumulative INTEGER NOT NULL, ratio NUMERIC(10, 4) NOT NULL, attachment_filename VARCHAR(255), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );
```
## ⚙️ Environment Variables

Create a `server/.env` file with the following configuration:

```env
PORT=5000
JWT_SECRET=your_super_secret_key
DB_USER=postgres
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=qms
```
*Important: Never commit this file. Add `.env` to your root configuration `.gitignore` parameters.*

## 🚀 Running the Application

### 1. Backend
```bash
cd server
npm install
npm start
```
*The server will run on `http://localhost:5000`.*

### 2. Frontend
```bash
cd client
npm install
npm run dev
```
*The frontend runs on `http://localhost:5173` and connects seamlessly to the backend API.*

### 3. Default Login Credentials
*Insert an initial test credential parameter into your users schema structure:*
## 🔒 Security Notes

⚠️ Prior to executing a true production pipeline deployment, enforce the following core criteria:

* **Password Hashing:** Ensure plain-text runtime storage parameters are migrated to robust `bcryptjs` encryption hashing workflows.
* **JWT Enforced Protection Middleware:** Secure all standard paths to protect backend operations from invalid request interceptions.
* **Environment Isolation:** Protect parameters inside `.env` allocations explicitly matching system parameters.

## 📄 License

This project is proprietary and developed exclusively for **SAZGAR Engineering Works**. Unauthorised distribution or replication is prohibited.
