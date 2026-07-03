# SAZGAR Quality Management System

A full‑stack web application for **SAZGAR Engineering Works** to manage Pre‑Delivery Inspection (PDI), Root Cause Analysis (RCA), QA Audit Reports, Dealership Complaints, Big Data libraries, and ISO Compliance documents. Built with React, Node.js, Express, and PostgreSQL.

---

## 📦 Features

| Module               | Description |
|----------------------|-------------|
| **PDI**              | Create, view, edit, and delete Pre‑Delivery Inspection records with dynamic checklists. |
| **Daily Report**     | Filter PDI data by date and search, view live analytics, and export to **Excel** or **PDF** (professional layout). |
| **RCA Reports**      | Upload, view, update, and delete Root Cause Analysis PDFs. |
| **RCA Videos**       | Upload, view, update, and delete related videos. |
| **QA Audit Reports** | Separate sections for Assembly and Paint audit PDFs. |
| **Dealership Complaints** | Submit, view, quick‑edit, delete complaints with file attachments (image/video). Media viewer inside modal. |
| **Big Data Library** | Upload, view, update, delete PDF datasets (predictive modeling, bulk analytics). |
| **ISO Compliance**   | Manage ISO 9001/IATF 16949 compliance documents (PDF uploads). |
| **Authentication**   | JWT‑based login, forgot password via security question or backup key, password reset. |
| **Responsive Sidebar** | Collapsible navigation with dynamic breadcrumbs. |

---

## 🛠️ Tech Stack

**Frontend**  
- React (Vite)  
- Tailwind CSS (utility‑first styling)  
- jsPDF & jspdf‑autotable (PDF generation)  
- SheetJS / xlsx (Excel export)  

**Backend**  
- Node.js  
- Express  
- PostgreSQL  
- Multer (file uploads)  
- jsonwebtoken (authentication)  
- bcryptjs (optional – currently passwords stored plain‑text)

**Database**  
- PostgreSQL with tables: `users`, `pdi_records`, `rca_reports`, `rca_videos`, `qa_assembly_reports`, `qa_paint_reports`, `dealership_complaints`, `big_data_reports`, `iso_compliance_reports`.

---

## 📂 Project Structure
