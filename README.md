# ThreatLens AI

An enterprise-grade AI-powered Cyber Threat Intelligence platform.

## Overview

ThreatLens AI unifies threat detection by combining computer vision, OCR, threat intelligence, and large language models into a single intelligent interface. It accepts various forms of input—including URLs, screenshots, QR codes, emails, phone numbers, and plain text—and routes each request through specialized AI pipelines.

## Project Structure

- `frontend/`: React + Vite frontend application.
- `backend/`: FastAPI Python backend orchestration layer.
- `docs/`: Product Requirements, Architecture, and Design documentation.
- `docker-compose.yml`: For running the stack via Docker.

## Setup Instructions

Please refer to the Implementation Handbook in `docs/Document 6.md` for full setup, architecture, and deployment instructions.

## Production Deployment
ThreatLens AI is optimized for cloud deployment using Docker, Vercel (Frontend), and Render (Backend).
For a comprehensive guide, refer to the [Deployment Documentation](docs/deployment.md).

Quick setup:
- Create `.env.production` from the template.
- Run locally with Docker Compose: `docker-compose -f docker-compose.prod.yml up -d --build`.
- CI/CD pipelines via GitHub actions are included for automated testing and building.

## License
[Add License Information]
