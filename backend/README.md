# Jumpstart Backend

Node + Express + MongoDB API for the Jumpstart frontend and service dashboard.

## Local Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Create `.env` from `.env.example`.

3. Set:
- `MONGODB_URI`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `CLIENT_ORIGIN`

4. Start the server:
```bash
npm start
```

Local API health:
`http://localhost:5000/api/health`

## Required Environment Variables

```env
PORT=5000
MONGODB_URI=...
JWT_SECRET=...
GOOGLE_CLIENT_ID=...
CLIENT_ORIGIN=http://localhost:5173
```

`CLIENT_ORIGIN` can be a comma-separated list in production, for example:

```env
CLIENT_ORIGIN=http://localhost:5173,https://jumpstart.launchpreview.live
```

## Main API Routes

- `POST /api/v1/user/auth/register`
- `POST /api/v1/user/auth/login`
- `POST /api/v1/user/auth/social-login`
- `GET /api/v1/user/init`
- `GET /api/v1/admin/live-data`

## Render Deploy

Use the root-level [render.yaml](/Users/kartikmalviya/Downloads/vibeCode/jumpstart%20-%20Copy/render.yaml).

Render service settings:

- Root Directory: `backend`
- Build Command: `npm install`
- Start Command: `npm start`

Environment variables on Render:

- `MONGODB_URI`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `CLIENT_ORIGIN=https://jumpstart.launchpreview.live`

After deploy, your backend URL will look like:

`https://your-service-name.onrender.com`

Health check:

`https://your-service-name.onrender.com/api/health`

## Railway Deploy

Railway can deploy directly from the `backend` folder.

Service settings:

- Root Directory: `backend`
- Start Command: `npm start`

Environment variables:

- `MONGODB_URI`
- `JWT_SECRET`
- `GOOGLE_CLIENT_ID`
- `CLIENT_ORIGIN=https://jumpstart.launchpreview.live`

After deploy, test:

`https://your-railway-domain/api/health`

## Reconnect Production Frontend

Once the backend is live on Render or Railway, update:

[frontend/.env.production](/Users/kartikmalviya/Downloads/vibeCode/jumpstart%20-%20Copy/frontend/.env.production)

from:

```env
VITE_API_URL=https://jumpstart.launchpreview.live/api/index.php
```

to either:

```env
VITE_API_URL=https://your-backend-host/api
```

or keep the PHP gateway and update:

`/home/u760337650/domains/launchpreview.live/public_html/jumpstart/api/index.php`

to:

```php
$backendBase = 'https://your-backend-host/api';
```

The second option lets the frontend stay unchanged on the domain.
