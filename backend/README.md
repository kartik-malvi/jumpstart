# Jumpstart Backend (MERN – Node + Express + MongoDB)

## Setup

1. **Install dependencies**
   ```bash
   cd backend && npm install
   ```

2. **Environment**
   - Copy `.env.example` to `.env` if you need a template.
   - Set `MONGODB_URI` (e.g. `mongodb://localhost:27017/jumpstart`).
   - Set `JWT_SECRET` to a strong random string.
   - For Google login, set `GOOGLE_CLIENT_ID` to your OAuth client ID.

3. **Run MongoDB**
   - Start MongoDB locally or use a cloud URI (e.g. MongoDB Atlas).

4. **Start the server**
   ```bash
   npm run dev
   ```
   Server runs at `http://localhost:5000`.

## API

- `POST /api/v1/user/auth/register` – name, email, password, password_confirmation, mobile
- `POST /api/v1/user/auth/login` – email, password → `{ success, data: { user, auth_token } }`
- `POST /api/v1/user/auth/social-login` – provider: "google", token: Google ID token
- `GET /api/v1/user/init` – Bearer token required → dashboard stats

## Frontend

Point the React app at this API by setting in `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

Then run the frontend from the project root: `cd frontend && npm run dev`.
