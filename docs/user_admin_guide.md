# ThreatLens AI - User & Admin Guide (v1.0)

## Overview
ThreatLens AI is an advanced threat intelligence and OSINT analysis platform designed for security analysts. It provides automated investigations for URLs, OCR text, QR codes, Emails, and Phone numbers, backed by an AI-driven threat scoring engine.

## 1. User Guide

### 1.1 Dashboard
The dashboard is the central hub for your investigations.
- **Threat Activity Map**: Visualizes the origin of investigated threats geographically.
- **Recent Activity**: Displays your latest investigations and their risk levels.
- **Quick Actions**: Start a new URL, OCR, or Phone investigation with one click.

### 1.2 Investigations
ThreatLens AI supports multiple investigation types:
- **URL Investigation**: Enter a domain or URL. The system will perform WHOIS lookups, DNS analysis, SSL inspection, and use AI to determine if the site is malicious (phishing, malware, etc.).
- **OCR Investigation**: Upload an image (e.g., a screenshot of a suspicious email or text message). The system extracts the text using Tesseract OCR and analyzes it for social engineering or malicious patterns.
- **Phone Investigation**: Enter a phone number (E.164 format recommended). The system validates the number, looks up carrier details, and analyzes historical threat patterns.
- **Email/QR Investigation**: (Features integrated directly into the OCR or URL modules based on content).

### 1.3 Analyst Workspace
The Analyst Workspace is designed for long-term tracking and organization.
- **Folders**: Group related investigations together (e.g., "Q3 Phishing Campaign").
- **Saved Searches**: Save complex queries (e.g., `risk:high status:completed`) to quickly pull up relevant historical data.

### 1.4 Reports
Every investigation generates a comprehensive report containing:
- A calculated **Threat Score (0-100)**.
- Extracted Indicators of Compromise (IOCs).
- Timeline of the investigation steps.
- AI-generated executive summary and mitigation recommendations.

---

## 2. Administrator Guide

### 2.1 User Management
- Administrators can manage user roles (Analyst vs. Admin) directly from the database or the upcoming Admin panel.
- Role-Based Access Control (RBAC) ensures standard users cannot delete global workspaces or other users' private investigations.

### 2.2 System Configuration
System parameters are controlled via environment variables (see `deployment.md`):
- `AI_PROVIDER`: Switch between `groq` and `tavily` or fallback providers.
- `AI_MODEL`: Set the LLM model used for the intelligence engine (default: `llama-3.3-70b-versatile`).
- `ACCESS_TOKEN_EXPIRE_MINUTES`: Control session length for analysts.

### 2.3 Monitoring & Logs
- **Audit Logs**: All user actions (logins, investigations, workspace modifications) are recorded in the `audit_logs` table.
- **Performance**: Monitor the `/api/v1/health` endpoint for system status. The AI engine includes built-in retries and timeouts configurable via `AI_TIMEOUT` and `AI_MAX_RETRIES`.

### 2.4 Data Retention & Backups
- The system supports automated database backups (configurable via `BACKUP_CRON_HOUR` and `BACKUP_CRON_MINUTE`). Ensure your host environment (e.g., Render or a standalone server) has access to a persistent volume mapped to `BACKUP_DIR`.
