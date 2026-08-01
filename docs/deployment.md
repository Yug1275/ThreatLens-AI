# ThreatLens AI - Global Deployment Guide (v1.0)

This document provides step-by-step manual deployment instructions for ThreatLens AI across Supabase, Render, and Vercel. 

## 1. Database Deployment (Supabase)

**Why it is required**: ThreatLens AI uses PostgreSQL to store users, investigations, workspaces, and audit logs. Supabase provides a managed, scalable PostgreSQL database.

**Website**: [https://supabase.com/dashboard](https://supabase.com/dashboard)

**Numbered Steps**:
1. Log in to Supabase and click **New Project**.
2. Select an organization, name the project (e.g., `ThreatLens-AI-DB`), and generate a strong database password. Choose a region closest to your users.
3. Once the project provisions (takes 2-3 minutes), go to **Settings > Database**.
4. Scroll down to **Connection string** > **URI** and copy the connection string.
5. Replace `[YOUR-PASSWORD]` in the URI with the password you generated. This is your `DATABASE_URL`.
6. (Optional) Run your initial database migrations using the Supabase SQL editor or Alembic if you have migration scripts.

**Verification**:
Go to the **Table Editor** in Supabase and verify that the core tables (`users`, `investigations`, `audit_logs`) exist after the backend connects and initializes them.

---

## 2. Backend Deployment (Render)

**Why it is required**: The FastAPI backend requires a scalable cloud environment to process AI analytics, investigations, and API requests securely.

**Website**: [https://dashboard.render.com](https://dashboard.render.com)

**Numbered Steps**:
1. Log in to Render and click **New > Web Service**.
2. Connect your GitHub repository and select the `ThreatLens AI` repository.
3. Configure the service:
   - **Name**: `threatlens-api`
   - **Language**: `Python 3`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Expand **Environment Variables** and add the following:
   - `DATABASE_URL` = (The Supabase connection string from step 1)
   - `JWT_SECRET_KEY` = (Generate a strong random string)
   - `JWT_ALGORITHM` = `HS256`
   - `GROQ_API_KEY` = (Your Groq AI API Key)
   - `TAVILY_API_KEY` = (Your Tavily API Key)
   - `AI_PROVIDER` = `groq`
5. Click **Create Web Service**.

**Verification**:
Once deployed, navigate to the Render URL (e.g., `https://threatlens-api.onrender.com/docs`). You should see the FastAPI Swagger UI indicating the backend is live.

---

## 3. Frontend Deployment (Vercel)

**Why it is required**: The React/Vite frontend must be served globally via a CDN for fast, responsive UI delivery to analysts.

**Website**: [https://vercel.com/dashboard](https://vercel.com/dashboard)

**Numbered Steps**:
1. Log in to Vercel and click **Add New > Project**.
2. Import the `ThreatLens AI` GitHub repository.
3. Configure the project:
   - **Project Name**: `threatlens-app`
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
4. Expand **Environment Variables** and add:
   - `VITE_API_URL` = `https://threatlens-api.onrender.com` (Replace with your actual Render URL)
5. Click **Deploy**.

**Verification**:
Navigate to the deployed Vercel domain (e.g., `https://threatlens-app.vercel.app`). The dashboard login screen should load perfectly. Log in to verify the API connection.

---

## 4. Custom Domain Setup (Optional)

1. Go to the Settings tab in your Vercel project and select **Domains**.
2. Enter your custom domain (e.g., `app.threatlens.ai`) and click **Add**.
3. Follow the DNS instructions provided by Vercel to configure your domain registrar (e.g., Namecheap, GoDaddy). Vercel will automatically provision an SSL certificate.

## Troubleshooting

- **CORS Errors**: Ensure the `VITE_API_URL` exactly matches the frontend origin that the backend expects, or configure the backend CORS middleware to accept the Vercel domain.
- **Database Connection Failed**: Double-check the Supabase `DATABASE_URL` password and ensure there are no special characters breaking the URI string format.
- **AI Analytics Failing**: Check the Render deployment logs to ensure `GROQ_API_KEY` and `TAVILY_API_KEY` are correctly injected.
