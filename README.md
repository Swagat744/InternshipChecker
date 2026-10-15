# InternShield AI 🛡️
> **"Before you trust the offer, verify the risk."**

**InternShield AI** is an intelligent fraud-detection system designed to protect students and job seekers from fraudulent internship offers, recruitment scams, and phishing lures. Built for the **TCS Technology Day P3 Problem Statement: Fake Internship Offer Detector**.

---

## 🌟 Key Features

- 📑 **Dual Input Channels:**
  - **Direct Text Input:** Paste offer emails, WhatsApp messages, or social media posts with character limits & live validation.
  - **Document Upload & Parsing:** Drag & drop **PDF (.pdf)**, **Word (.docx)**, and **Plain Text (.txt)** files up to 10 MB with automated text extraction and editable preview.
- 🧠 **Hybrid Detection Engine:**
  - **Deterministic Fraud Rules:** Pattern matching for upfront payment demands, credential theft, urgent threats, selection without interviews, and free-mail recruiters.
  - **Nugen AI Inference:** Integrates with Nugen Intelligence (`api.nugen.in`) using instruction-aligned models to analyze contextual semantics and assess nuance.
  - **Prompt Injection Guardrails:** Treats all offer and document text as untrusted data.
  - **Graceful Fallback:** Automatically switches to deterministic rules if the AI provider is offline or unconfigured.
- 📊 **Comprehensive Risk Assessment:**
  - **Risk Classification:** `SAFE`, `SUSPICIOUS`, or `HIGH RISK`.
  - **Heuristic Risk Score:** 0–100 score explicitly labeled as an estimated heuristic indicator.
  - **Quoted Evidence vs. Inference:** Every warning links to quoted excerpts from the text.
  - **Entity Extraction:** Extracts Company, Role, Stipend/Salary, Payment Demands, Urgency, and Recruiter Contact.
  - **Actionable Checklist:** Step-by-step verification checklist for students.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Lucide React icons
- **Backend:** Node.js (ES Modules), Express.js
- **Document Processing:** `pdf-parse`, `mammoth` (DOCX), native UTF-8 streaming
- **AI Engine:** Nugen Intelligence API (`https://api.nugen.in/api/v3/inference/completions`)

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Installation

Clone the repository:
```bash
git clone https://github.com/Swagat744/InternshipChecker.git
cd InternshipChecker
```

Install backend dependencies:
```bash
cd backend
npm install
```

Install frontend dependencies:
```bash
cd ../frontend
npm install
```

---

### 3. Environment Configuration

Create `.env` inside the `backend` folder:
```bash
cd ../backend
cp .env.example .env
```

Configure your variables in `backend/.env`:
```env
PORT=5000
CORS_ORIGIN=http://localhost:5173
NUGEN_API_KEY=your_nugen_api_key_here
```
*(Note: If no API key is provided, the application runs in rules-based fallback mode).*

---

### 4. Running the Application

**Terminal 1 — Backend:**
```bash
cd backend
npm start
```
*Backend runs on `http://localhost:5000`*

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
*Frontend runs on `http://localhost:5173` (or `http://localhost:5174`)*

---

## 🧪 Testing

The backend includes comprehensive automated test suites:
```bash
cd backend
npm test
```
Tests cover:
- High-risk offers with upfront payment demands.
- Suspicious offers with vague terms.
- Low-risk offers with verified disclaimers.
- Multi-format document extraction (PDF, DOCX, TXT).
- Scanned PDF detection (OCR unavailability message).
- Nugen AI mock tests, authentication errors, timeouts, and rate limits.

---

## 🔒 Security & Privacy

- **Memory-only processing:** Uploaded documents are processed entirely in memory buffers and released immediately after extraction. No documents or user inputs are permanently stored.
- **Key isolation:** The Nugen API key is strictly stored on the server and never exposed to the frontend or browser.
- **Untrusted input sanitization:** Document contents and offer texts are never executed as HTML or scripts.

---

## ⚖️ Disclaimer

InternShield AI provides estimated heuristic risk assessments based on common scam patterns. It is not definitive proof of fraud or legitimacy. Students are always advised to verify job offers directly through official company websites and their institution's placement cell.
