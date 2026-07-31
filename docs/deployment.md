# ThreatLens AI Deployment Guide

## Prerequisites
- A GitHub repository with the ThreatLens AI code.
- Accounts on Supabase (Database), Vercel (Frontend), and Render (Backend).

## 1. Database (Supabase)
1. Ensure your PostgreSQL database is running on Supabase.
2. Under **Project Settings > Database**, retrieve your connection string (URI).
3. Under **Project Settings > API**, retrieve your `SUPABASE_URL`, `anon` key, and `service_role` key.

## 2. Backend (Render)
1. Log in to [Render](https://dashboard.render.com).
2. Click **New** -> **Blueprint**.
3. Connect your GitHub repository.
4. Render will use the `render.yaml` to automatically provision the web service using the Docker environment.
5. Once the service is created, navigate to the **Environment** tab.
6. Add all required secrets based on the `.env.production` file. 
   - `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET_KEY`, `CORS_ORIGINS`.
7. Click **Save Changes** and wait for the deployment to finish.
8. Verify health by visiting `https://<your-render-url>/health`.

## 3. Frontend (Vercel)
1. Log in to [Vercel](https://vercel.com).
2. Click **Add New...** -> **Project**.
3. Import your GitHub repository.
4. Set the **Framework Preset** to `Vite`.
5. Set the **Root Directory** to `frontend`.
6. Add the environment variable `VITE_API_BASE_URL` pointing to your Render backend URL (e.g., `https://your-backend.onrender.com/api/v1`).
7. Click **Deploy**.
8. Verify that the frontend loads and connects to the backend successfully.

## Security Considerations
- Never expose your `.env.production` file in your repository.
- Use `render.yaml` only with non-sensitive variable definitions. Secure secrets must be manually added in the Render dashboard.
- Ensure your `CORS_ORIGINS` in Render exactly matches your Vercel deployment URL.

## Monitoring & Health Checks
The backend offers robust health check endpoints:
- `/health`: Detailed service statuses including response time.
- `/ready`: Lightweight check for readiness probes.
- `/live`: Lightweight check for liveness probes.
