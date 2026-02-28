# Placement Statistics Portal

A full-stack web application designed to track, analyze, and display college placement statistics. Built with React and Node.js/Express.

## Features
- **Dashboard Overview:** Key metrics including highest package, average package, and total offers.
- **Visual Analytics:** Interactive charts for salary distribution and role engagement types.
- **Company Directory:** Searchable and filterable list of all recruiting companies.
- **Detailed Tracking:** View specific role packages, candidate shortlists, eligibility, and the original raw messages for transparency.
- **Data Privacy:** Raw data is systematically cleaned to remove PII (Phone numbers and Emails).

## Tech Stack
- **Frontend:** React, Tailwind CSS, Recharts
- **Backend:** Node.js, Express

## Getting Started Locally

1. **Install Dependencies**
   ```bash
   # From the root directory:
   npm run build:frontend
   npm install --prefix backend
   ```

2. **Run the Application**
   ```bash
   # Start the backend API (Runs on port 5000)
   npm start

   # Start the React frontend (Runs on port 3000)
   npm run start:frontend
   ```

## Deployment
This project is structured as a monorepo for easy deployment.
- **Frontend:** Deploy the `frontend/` directory to Vercel or Netlify.
- **Backend:** Deploy the root directory to Render or Heroku, setting the build command to `npm install --prefix backend` and start command to `node backend/server.js`.

> Note: The raw source data (`chat data/`) containing sensitive PII and internal documents is explicitly `.gitignore`d. Only the aggregated and cleaned `placement_data.json` is exposed to the server.
