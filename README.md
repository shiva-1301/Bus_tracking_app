# 🚌 SmartBus Tracker

Real-time college bus tracking. Passengers find buses by **bus number** or by the **two stops they travel between**, then follow drivers live. Drivers start a trip and share their GPS position. Everyone can leave reviews.

> **Live demo:** _coming soon — see [Deployment](#deployment)_

![Screenshot placeholder](docs/screenshot-landing.png)
<!-- Add screenshots to docs/ (landing, dashboard, tracking, driver trip) -->

## Features

- **Find by number:** see every live driver currently running a given bus.
- **Find by route:** pick a "from" and "to" stop and get the buses that connect them, along with their live drivers.
- **Live tracking:** keep a personal list of tracked buses that refreshes every 30 seconds and shows when a trip has ended.
- **Driver mode:** start a trip with a bus number and route. The app sends GPS updates every 60 seconds; end the trip to remove your location data.
- **Reviews:** rate buses 1–5 stars and see the average rating.
- **Accounts:** JWT login and registration with separate passenger and driver roles.
- Responsive and accessible: works on mobile, tablet and desktop, and supports keyboard use and screen readers.

## Tech stack

| Layer    | Tech |
|----------|------|
| Frontend | Angular 20 (standalone components), Tailwind CSS v4 |
| Backend  | Node.js, Express 4, JWT (`jsonwebtoken`), `bcryptjs` |
| Database | MongoDB with Mongoose 8 |

## Project structure

```
.
├── app.js                 # Express app (API + serves the built Angular app)
├── bin/www                # Server entry point
├── app_server/
│   ├── config.js          # Env-based configuration
│   ├── controllers/       # users, locations, coordinates, reviews
│   ├── middleware/auth.js # JWT verification
│   ├── models/            # Mongoose schemas
│   ├── routes/            # /api/* routers
│   └── utils/             # input validation helpers
├── app_public/            # Angular frontend
│   └── src/
│       ├── app/           # pages, services, shared helpers
│       ├── environments/  # API URL / Maps key per environment
│       └── styles.css     # design tokens + shared UI classes
├── scripts/dev/           # one-off DB debugging scripts
└── render.yaml            # one-click Render deployment
```

## Getting started (local)

**Prerequisites:** Node.js 20.12 or newer, and MongoDB (local, or a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster).

```bash
# 1. Install backend dependencies
npm install

# 2. Configure environment
cp .env.example .env        # then edit MONGODB_URI and JWT_SECRET

# 3. Install frontend dependencies
npm --prefix app_public install
```

Run the API and the Angular dev server in two terminals:

```bash
npm run dev:api     # API on http://localhost:3000
npm run dev:web     # Frontend on http://localhost:4200
```

Production-style run (one server for everything):

```bash
npm run build && npm start   # http://localhost:3000
```

### Environment variables

| Variable       | Required | Description |
|----------------|----------|-------------|
| `MONGODB_URI`  | yes      | MongoDB connection string |
| `JWT_SECRET`   | yes in production | Long random string used to sign login tokens |
| `JWT_EXPIRES_IN` | no     | Token lifetime (default `7d`) |
| `CORS_ORIGIN`  | no       | Allowed frontend origin (default `*`) |
| `PORT`         | no       | Server port (default `3000`) |

**Google Maps (optional):** to show map thumbnails, put a Maps Static API key in `app_public/src/environments/environment*.ts`. Browser keys are always public, so restrict yours to your domain in Google Cloud Console. Without a key, the cards show a placeholder and an "Open in Google Maps" link.

## API overview

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/register` | – | Create account (`role`: `user` or `driver`) |
| POST | `/api/login` | – | Log in, returns JWT |
| GET  | `/api/search/bus/:busNumber` | – | Drivers registered on a bus |
| POST | `/api/locations/start` | driver | Start a trip |
| PUT  | `/api/locations/update` | driver | Update trip location |
| POST | `/api/locations/end` | driver | End a trip |
| GET  | `/api/locations/check` | user | Does the driver have an active trip? |
| GET  | `/api/locations/bus/:busNumber` | – | Active trips for a bus |
| PUT  | `/api/coordinates` | driver | Push latest GPS coordinate |
| POST | `/api/coordinates/delete` | driver | Delete the driver's coordinates |
| GET  | `/api/reviews` | – | All reviews |
| POST | `/api/reviews` | – | Add a review |

## Deployment

The easiest free option is **Render**: a single web service runs the API and serves the Angular build.

1. Create a free **MongoDB Atlas** cluster and copy its connection string. In Atlas, allow network access from `0.0.0.0/0`.
2. Push this branch to GitHub.
3. On [render.com](https://render.com), click **New → Blueprint** and select this repo. Render reads `render.yaml`.
4. When prompted, set `MONGODB_URI` to the Atlas string and `CORS_ORIGIN` to your Render URL. `JWT_SECRET` is generated automatically.
5. Deploy, then put the live URL at the top of this README.

## License

MIT. This was a student project, originally built in first year of college.
