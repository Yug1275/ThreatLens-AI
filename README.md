# 🚀 ThreatLens AI

<div align="center">

<img src="./frontend/public/logo.png" alt="ThreatLens AI Logo" width="120" />

### Enterprise-grade, AI-powered Cyber Threat Intelligence Platform

Unifies threat detection by combining deterministic OSINT analysis with an intelligent LLM engine to orchestrate deep investigations and generate actionable mitigation reports.

![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)
![Python](https://img.shields.io/badge/Python-3-3776AB?style=for-the-badge&logo=python)

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

ThreatLens AI unifies threat detection by combining deterministic OSINT analysis (WHOIS, DNS, SSL) with an intelligent Large Language Model (LLM) engine. Designed for security analysts, it accepts URLs, phone numbers, and images (OCR) to automatically orchestrate deep investigations and generate actionable mitigation reports.

Whether you're investigating a suspicious URL, tracking down a malicious phone number, or extracting text from a potential phishing email screenshot, ThreatLens AI provides a fast, secure, and scalable solution.

---

# ✨ Features

## 🔍 Multi-Modal Investigations
- **URL Analysis**: Deep scan of domains including WHOIS and DNS records.
- **Phone Number Recon**: Extract carrier and geographic intelligence.
- **Image OCR**: Extract text and potential threats from images using EasyOCR.

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

```mermaid
flowchart TD
    %% Styling
    classDef frontend fill:#E8EAF6,stroke:#3F51B5,stroke-width:2px,color:#1A237E
    classDef backend fill:#E0F2F1,stroke:#009688,stroke-width:2px,color:#004D40
    classDef db fill:#FFF9C4,stroke:#FBC02D,stroke-width:2px,color:#F57F17
    classDef external fill:#FCE4EC,stroke:#E91E63,stroke-width:2px,color:#880E4F

    %% Client
    Browser[Browser Client]

    %% Frontend
    subgraph FrontendApp [Frontend (React 19 + Vite)]
        Pages[Pages<br/>Dashboard, Investigations]
        APIClient[API Service Client]
        Pages --> APIClient
    end

    %% Backend
    subgraph BackendApp [Backend (FastAPI App)]
        APIRoutes[API Routes]
        
        Classifier{Input Type Classifier}
        
        URLMod[URL Analyzer<br/>WHOIS, DNS]
        PhoneMod[Phone Analyzer<br/>Carrier, Geo]
        ImageMod[OCR Pipeline<br/>EasyOCR]
        
        AIEngine[AI Intelligence Engine<br/>Groq/Llama-3]
        Fallback[Deterministic Threat Scorer]

        APIRoutes --> Classifier
        
        Classifier -->|URL| URLMod
        Classifier -->|Phone| PhoneMod
        Classifier -->|Image| ImageMod
        
        URLMod --> AIEngine
        PhoneMod --> AIEngine
        ImageMod --> AIEngine
        
        AIEngine --> Fallback
    end

    %% Database
    subgraph Database [Database]
        Supabase[(Supabase<br/>PostgreSQL)]
    end

    %% External Services
    subgraph External [External Services]
        GroqAPI((Groq API))
        TavilyAPI((Tavily Search API))
    end

    %% Connections
    Browser -->|HTTPS| Pages
    APIClient -->|REST/JSON| APIRoutes
    
    AIEngine <-->|API Calls| GroqAPI
    URLMod <-->|Search| TavilyAPI
    
    BackendApp <--> Supabase
    
    %% Hosting Note
    class FrontendApp,Pages,APIClient frontend
    class BackendApp,APIRoutes,Classifier,URLMod,PhoneMod,ImageMod,AIEngine,Fallback backend
    class Database,Supabase db
    class External,GroqAPI,TavilyAPI external
```


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
    participant OSINT as OSINT Tools (WHOIS/DNS)
    participant AI as AI Engine (Groq/Llama-3)

    %% 1. Analyst initiates investigation
    Analyst->>Frontend: Submit IOC (URL, Phone, Image)
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
    Backend->>OSINT: Query WHOIS, DNS, or OCR extraction
    activate OSINT
    OSINT-->>Backend: Return deterministic data
    deactivate OSINT
    
    %% 4. AI Contextual Analysis
    Backend->>AI: Send OSINT data for contextual analysis
    activate AI
    AI-->>Backend: Return executive summary & mitigation
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
│   │   ├── pages/          # Application pages (Dashboard, Investigation)
│   │   └── utils/          # Frontend utilities & API calls
│   ├── package.json        
│   └── vite.config.js      
│
├── backend/                # FastAPI Backend
│   ├── app/             
│   │   ├── api/            # API Route definitions (v1)
│   │   ├── core/           # Security, config, exceptions
│   │   ├── models/         # SQLAlchemy schemas
│   │   ├── schemas/        # Pydantic validation models
│   │   └── utils/          # Helper utilities (OCR, AI integration)
│   ├── requirements.txt        
│   └── Dockerfile      
│
├── docs/                   # Project documentation
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
|---------|----------|-------------|
| POST | `/api/v1/auth/login` | Authenticate user |
| POST | `/api/v1/auth/register` | Register new user |
| POST | `/api/v1/investigations/url` | Investigate a URL |
| POST | `/api/v1/investigations/phone` | Investigate a phone number |
| POST | `/api/v1/investigations/image` | Upload image for OCR extraction |
| GET | `/api/v1/investigations/{id}` | Retrieve investigation report |

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
