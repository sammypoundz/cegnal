# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
# cegnal


## Deploying to Render

This repo deploys as a **single Render Web Service** that serves both the API (`/api/*`)
and the built React frontend from the same Express server — no CORS issues, one URL.

### Option A — Blueprint (recommended)
1. Push this repo to GitHub (already done: `sammypoundz/cegnal`).
2. On [Render](https://dashboard.render.com) → **New → Blueprint** → select the repo. Render reads `render.yaml`.
3. Fill in the `sync: false` env vars in the dashboard:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | MongoDB Atlas connection string (same as local `.env`) |
   | `ALLOWED_ORIGINS` | `https://<your-app>.onrender.com` |
   | `VITE_API_URL` | `https://<your-app>.onrender.com/api` |
   | `SMTP_*`, `EMAIL_FROM` | your Gmail SMTP values from `.env` |
   | `PAYSTACK_*` | your Paystack keys |

   `JWT_SECRET` is auto-generated.

### Option B — Manual Web Service
- **Runtime:** Node · **Build command:** `npm ci && npm run build` · **Start command:** `npm start`
- **Health check path:** `/api/health` · Same env vars as above.

### Important notes
- `VITE_API_URL` is a **build-time** variable (baked into the JS bundle). If you change it,
  re-deploy (the build re-runs) — changing it in the dashboard alone is not enough.
- MongoDB Atlas: allow connections from anywhere (`0.0.0.0/0`) in the Atlas network access
  panel, since Render's egress IPs aren't fixed on the free plan.
- On Render's free plan the service sleeps after 15 min idle; the first request after sleep
  takes ~30s to respond.
- Set a real `JWT_SECRET` value in the dashboard if you prefer your own over Render's random one.
