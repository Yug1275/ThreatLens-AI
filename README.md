# ThreatLens AI (V1.0)

An enterprise-grade, AI-powered Cyber Threat Intelligence platform.

## Overview

ThreatLens AI unifies threat detection by combining deterministic OSINT analysis (WHOIS, DNS, SSL) with an intelligent Large Language Model (LLM) engine. Designed for security analysts, it accepts URLs, phone numbers, and images (OCR) to automatically orchestrate deep investigations and generate actionable mitigation reports.

## Features

- **Multi-Modal Investigations**: Investigate malicious URLs, suspicious phone numbers, and extract threats from images using OCR.
- **AI Intelligence Engine**: Contextual analysis of IOCs using Groq/Llama-3 to generate executive summaries and mitigate threats.
- **Analyst Workspace**: Organize investigations into folders, use saved queries, and track historical data via an intuitive Dashboard.
- **Secure & Scalable**: Role-Based Access Control (RBAC), JWT authentication, comprehensive audit logging, and Pydantic v2 data validation.

## Tech Stack

- **Frontend**: React 19, Vite, Bootstrap 5, Framer Motion, Recharts.
- **Backend**: FastAPI, Python 3, SQLAlchemy, Pydantic, Passlib.
- **Database**: PostgreSQL (Supabase).
- **AI Integrations**: Groq (LLMs), Tavily (Search).

## Architecture

ThreatLens AI uses a decoupled, service-oriented architecture:
- A reactive Single Page Application (SPA) frontend communicates via a RESTful API to a FastAPI backend.
- The backend utilizes a provider-pattern for its AI Intelligence Engine, seamlessly falling back to deterministic threat scoring if external LLMs fail.
- All state is securely persisted in PostgreSQL.

## Documentation

- [Deployment Guide](docs/deployment.md) - Manual instructions for deploying to Vercel, Render, and Supabase.
- [User & Admin Guide](docs/user_admin_guide.md) - Detailed guide on using the platform and configuring settings.
- [Release Report V1.0](docs/release_report_v1.0.md) - Version summary and feature breakdown.
- [API Setup Guide](docs/Phase9_API_Setup_Guide.md) - AI Provider API configuration.

## Setup Instructions (Local)

1. Clone the repository and navigate to the project directory.
2. In the `backend` directory, create a `.env` file containing your `DATABASE_URL` and `GROQ_API_KEY`.
3. Run `pip install -r requirements.txt` and `uvicorn app.main:app --reload`.
4. In the `frontend` directory, run `npm install` and `npm run dev`.

## License
MIT License
