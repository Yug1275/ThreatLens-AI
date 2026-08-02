# 🚀 ThreatLens AI

<div align="center">

<img src="./frontend/public/logo.png" alt="ThreatLens AI Logo" width="120" />

### Enterprise-grade, AI-powered Cyber Threat Intelligence Platform

Unifies threat detection by combining deterministic OSINT analysis with an intelligent LLM engine to orchestrate deep investigations and generate actionable mitigation reports.

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)
![Python](https://img.shields.io/badge/Python-3-3776AB?style=for-the-badge&logo=python)

[![Live Demo](https://img.shields.io/badge/🚀%20Live%20Demo-ThreatLens%20AI-success?style=for-the-badge)](https://threat-lens-ai-yug.vercel.app/)

</div>

---

# 📖 Table of Contents

- About
- Features
- Tech Stack
- System Architecture
- Sequence Diagram
- Project Structure
- Getting Started
- Environment Variables
- API Overview
- Security Features
- Documentation
- Contributing
- License

---

# ✨ About ThreatLens AI

ThreatLens AI is an enterprise-grade AI-powered Cyber Threat Intelligence Platform that enables security analysts and organizations to investigate multiple threat vectors through a single unified interface.

The platform supports deep investigations for:

- 🌐 URLs
- 📧 Emails
- 📱 Phone Numbers
- 🔳 QR Codes
- 🖼 Images (OCR)

ThreatLens AI combines deterministic threat analysis (WHOIS, DNS, SSL, OCR, QR decoding, metadata extraction, and validation) with AI-powered intelligence to generate executive summaries, technical reports, IOC correlation, threat explanations, and mitigation recommendations.

The platform also includes investigation history, reports, analyst workspace, notifications, dashboards, and security monitoring to streamline cyber threat investigations.

---

# ✨ Features

## 🔍 Multi-Modal Investigations

- 🌐 URL Investigation
  - WHOIS Lookup
  - DNS Analysis
  - SSL Inspection
  - Redirect Chain Analysis
  - Threat Scoring

- 📧 Email Investigation
  - Header Analysis
  - SPF / DKIM / DMARC Validation
  - Phishing Detection
  - Typosquatting Detection
  - IOC Extraction

- 📱 Phone Investigation
  - Number Validation
  - Carrier Detection
  - Geographic Intelligence
  - Scam Detection

- 🖼 OCR Investigation
  - EasyOCR Text Extraction
  - Threat Detection
  - Entity Extraction
  - Deep Investigation Routing

- 🔳 QR Investigation
  - QR Decoding
  - Payload Classification
  - Safe Preview
  - IOC Extraction
  - Deep Investigation Routing

## 🧠 AI Intelligence Engine
- **Contextual Analysis**: Contextual analysis of IOCs using Groq/Llama-3.
- **Automated Reporting**: Generates executive summaries and mitigation strategies.
- **Fallback Mechanism**: Seamlessly falls back to deterministic threat scoring if external LLMs fail.

## 👨‍💻 Analyst Workspace
- **Investigation Folders**: Organize investigations into logical folders.
- **Dashboard**: Track historical data and threat trends via an intuitive dashboard.
- **Saved Queries**: Save and re-run common investigations.

## 🔒 Secure & Scalable
- **Role-Based Access Control (RBAC)**: Fine-grained permissions.
- **JWT Authentication**: Secure API access.
- **Audit Logging**: Comprehensive tracking of user actions.
- **Data Validation**: Pydantic v2 ensures strict data schema enforcement.

---

# 🛠 Tech Stack

| Category | Technologies |
|-----------|--------------|
| Frontend | React 19, Vite, Bootstrap 5, Framer Motion, Recharts |
| Backend | Python 3, FastAPI, SQLAlchemy, Pydantic |
| Database | PostgreSQL (Supabase) |
| AI Integrations | Groq (LLMs), Tavily (Search) |
| OCR | EasyOCR |
| Authentication | Passlib, Python-JOSE (JWT) |
| Deployment | Docker, Vercel, Render |

---

# 🏗 System Architecture

<p align="center">
  <img src="./docs/architecture_diagram.png" alt="ThreatLens AI System Architecture" width="100%" />
</p>


---

# 🔄 System Sequence Diagram

> The following sequence diagram outlines the core threat investigation journey, from input submission to AI-generated mitigation reports.

```mermaid
sequenceDiagram
    autonumber
    actor Analyst
    participant Frontend as React Frontend
    participant Backend as FastAPI Backend
    participant DB as PostgreSQL
    participant OSINT as OSINT & Forensics (WHOIS/DNS/Headers/OCR/QR)
    participant AI as AI Engine (Groq/Llama-3)

    %% 1. Analyst initiates investigation
    Analyst->>Frontend: Submit IOC (URL, Email, Phone, QR, Image)
    activate Frontend
    Frontend->>Backend: Request investigation with JWT
    activate Backend
    
    %% 2. Validate and Save Request
    Backend->>Backend: Validate payload (Pydantic)
    Backend->>DB: Log investigation request
    activate DB
    DB-->>Backend: Log saved
    deactivate DB
    
    %% 3. Deterministic OSINT Gathering
    Backend->>OSINT: Query WHOIS, DNS, Email headers, Phone carrier, QR decoder, or OCR extraction
    activate OSINT
    OSINT-->>Backend: Return deterministic data & threat score
    deactivate OSINT
    
    %% 4. AI Contextual Analysis
    Backend->>AI: Send OSINT data for contextual analysis
    activate AI
    AI-->>Backend: Return executive summary, MITRE mapping & mitigation
    deactivate AI
    
    %% 5. Save Results
    Backend->>DB: Save complete investigation report
    activate DB
    DB-->>Backend: Saved successfully
    deactivate DB
    
    %% 6. Return Data
    Backend-->>Frontend: Return investigation report
    deactivate Backend
    Frontend-->>Analyst: Display dashboard & report
    deactivate Frontend
```

---

# 📂 Project Structure

```text
ThreatLens-AI/
├── frontend/               # React Frontend (Vite + Bootstrap)
│   ├── public/             # Static assets (Logos, Icons)
│   ├── src/                
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (AuthContext, NotificationContext)
│   │   ├── hooks/          # Custom React Hooks
│   │   ├── layouts/        # Layout wrappers (DashboardLayout, MainLayout)
│   │   ├── pages/          # Application Pages
│   │   │   ├── Dashboard
│   │   │   ├── URL Investigation
│   │   │   ├── Email Investigation
│   │   │   ├── Phone Investigation
│   │   │   ├── QR Investigation
│   │   │   ├── OCR Investigation
│   │   │   ├── Reports
│   │   │   ├── History
│   │   │   ├── Workspace / IOC Repository
│   │   │   ├── Notifications
│   │   │   └── Settings
│   │   ├── services/       # API Client Services (investigationService, aiService, etc.)
│   │   └── utils/          # Frontend utilities (Axios instance)
│   ├── package.json        
│   └── vite.config.js      
│
├── backend/                # FastAPI Backend
│   ├── app/             
│   │   ├── api/            # API Route definitions (/v1/auth, /v1/investigation, /v1/ai)
│   │   ├── core/           # Security, config, middleware, database connection
│   │   ├── models/         # SQLAlchemy schemas (User, Investigation, AuditLog)
│   │   ├── repositories/   # Data access repositories (user_repository, investigation_repository)
│   │   ├── schemas/        # Pydantic validation models
│   │   ├── services/       # Core Business Logic & Intelligence Services
│   │   │   ├── ai/         # AI Engine (Groq Provider, Tavily, Prompts, Confidence Engine)
│   │   │   ├── url_investigator.py
│   │   │   ├── email_investigator.py
│   │   │   ├── phone_investigator.py
│   │   │   ├── qr_investigator.py
│   │   │   └── ocr_investigator.py
│   │   └── utils/          # Helper utilities
│   ├── requirements.txt        
│   └── Dockerfile      
│
├── docs/                   # Project documentation & Architecture assets
├── nginx/                  # Nginx configuration for production
├── docker-compose.yml      # Local dev environment
└── README.md               # Project documentation
```

---

# 🚀 Getting Started

## Clone Repository

```bash
git clone https://github.com/Yug1275/ThreatLens-AI.git

cd ThreatLens-AI
```

---

## Install Dependencies & Setup (Local)

### 1. Configure Environment Variables
In the `backend` directory, create a `.env` file based on `.env.example`.

### 2. Start the Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```

Application URLs:
```text
Frontend: http://localhost:5173
Backend API: http://localhost:8000
API Docs: http://localhost:8000/docs
```

---

# ⚙️ Environment Variables

Create a `.env` file inside the `backend` directory.

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/threatlens

# Security
SECRET_KEY=your_super_secret_jwt_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# External APIs
GROQ_API_KEY=your_groq_api_key
TAVILY_API_KEY=your_tavily_api_key
```

---

# 📡 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | Authenticate user |
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/investigation/url` | URL Investigation |
| POST | `/api/v1/investigation/email` | Email Investigation |
| POST | `/api/v1/investigation/phone` | Phone Investigation |
| POST | `/api/v1/investigation/ocr` | OCR Investigation |
| POST | `/api/v1/investigation/qr` | QR Investigation |
| GET | `/api/v1/investigation/{id}` | Investigation Details |
| GET | `/api/v1/investigation/` | Investigation History (Paginated & Filtered) |
| GET | `/api/v1/dashboard` | Dashboard Statistics |
| GET | `/api/v1/iocs` | Global IOC Repository |

---

# 🔒 Security Features

- **JWT Authentication**: Short-lived access tokens.
- **Password Encryption**: bcrypt hashing via Passlib.
- **RBAC**: Strict role-based access control for Analyst/Admin roles.
- **Input Validation**: Robust validation against SQLi and XSS via Pydantic.
- **Audit Logs**: Every investigation action is securely logged in the database.

---

# 📚 Documentation

For more detailed information, please refer to our dedicated documentation files:
- [Deployment Guide](docs/deployment.md) - Manual instructions for deploying to Vercel, Render, and Supabase.
- [User & Admin Guide](docs/user_admin_guide.md) - Detailed guide on using the platform and configuring settings.
- [Release Report V1.0](docs/release_report_v1.0.md) - Version summary and feature breakdown.
- [API Setup Guide](docs/Phase9_API_Setup_Guide.md) - AI Provider API configuration.

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

# 📄 License

This project is licensed under the MIT License.
