# Carpool Planner

App to easily plan carpool schedules.

## Features

- Add parents/drivers with available weekdays and seat capacity
- Add children and link them to a parent
- Generate a fair weekly driving schedule (round-robin by fewest drives)
- Auth0 login – only authenticated users can access the planner
- Data persisted in browser `localStorage`

## Auth0 Setup

This app uses [Auth0](https://auth0.com) for authentication.

1. Create a free Auth0 account and navigate to **Applications → Create Application**.
2. Choose **Single Page Application**.
3. In **Application Settings**, add your deployment URL to:
   - **Allowed Callback URLs**
   - **Allowed Logout URLs**
   - **Allowed Web Origins**

   Example values for local Docker testing: `http://localhost`

## Running with Docker

```bash
# 1. Copy the example env file and fill in your Auth0 credentials
cp .env.example .env

# 2. Build and start
docker-compose up --build

# 3. Open http://localhost in your browser
```

## Local Development (without Docker)

```bash
# 1. Edit config.js and replace the placeholder values with your Auth0 credentials
# 2. Serve the files with any static server, e.g.:
python3 -m http.server 8080
# 3. Open http://localhost:8080
```

> **Tip:** If `config.js` still contains the placeholder values, the app runs in
> development mode and skips authentication so you can test locally without Auth0.

