# Setup Guide for Scoutool Suite

## Local Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Backend Server (Local)

1. **Install dependencies:**
```bash
npm install
```

2. **Create .env file:**
```bash
cp .env .env.local
```

3. **Edit .env.local with your config:**
```
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000
```

4. **Start server:**
```bash
npm start
# OR with auto-reload:
npm run dev
```

Server runs at: `http://localhost:3001`

---

## Deployment on Vercel (Frontend)

### 1. Connect Repository
- Go to [vercel.com](https://vercel.com)
- Click "New Project"
- Import your GitHub repository

### 2. Set Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```
REACT_APP_API_URL=http://YOUR_SERVER_IP:3001/api
REACT_APP_ENV=production
REACT_APP_USE_SERVER=true
```

Replace `YOUR_SERVER_IP` with:
- Your actual IP address (e.g., `192.168.1.100`)
- Or your server domain (e.g., `api.scoutool.com`)

### 3. Deploy
- Click "Deploy"
- Wait for build to complete

---

## Deployment on Heroku (Backend)

### 1. Create Heroku App
```bash
heroku create your-app-name
```

### 2. Set Environment Variables
```bash
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-vercel-app.vercel.app
```

### 3. Add Procfile
Create `Procfile` in root:
```
web: node server/index.js
```

### 4. Deploy
```bash
git push heroku main
```

### 5. Get Heroku App URL
```bash
heroku apps:info
```

Then update Vercel env vars with this URL:
```
REACT_APP_API_URL=https://your-app-name.herokuapp.com/api
```

---

## Alternative: Deploy Backend on Render

### 1. Create New Web Service
- Go to [render.com](https://render.com)
- Click "New +" → "Web Service"
- Connect GitHub repository

### 2. Configure
- **Build Command:** `npm install`
- **Start Command:** `node server/index.js`
- **Environment:** Node
- **Region:** Choose closest to you

### 3. Add Environment Variables
```
NODE_ENV=production
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### 4. Deploy
- Click "Create Web Service"
- Get your Render URL from dashboard

Then update Vercel env vars:
```
REACT_APP_API_URL=https://your-app.onrender.com/api
```

---

## Local Testing with Frontend

### Option 1: Direct File
Open `index.html` directly in browser (limited functionality)

### Option 2: Local Server
```bash
# In another terminal, start simple HTTP server
python -m http.server 3000
# or
npx http-server -p 3000
```

Frontend: `http://localhost:3000`
Backend: `http://localhost:3001`

---

## Configuration Priority

The app uses this priority for API URL:

1. **Environment Variable** → `REACT_APP_API_URL`
2. **Window Config** → `window.SCOUTOOL_CONFIG.apiURL`
3. **Auto-detect** → Based on hostname
4. **Fallback** → `http://localhost:3001/api`

---

## Troubleshooting

### CORS Errors
- Ensure backend is running and accessible
- Check `FRONTEND_URL` in backend .env matches your frontend URL
- Check `REACT_APP_API_URL` in Vercel env

### Connection Refused
- Backend server is not running
- Start with: `npm start`

### 404 on API Calls
- Check your `REACT_APP_API_URL` is correct
- Backend health check: `curl http://localhost:3001/api/health`

### Scraping Not Working
- Use server mode (requires backend)
- If server fails, falls back to proxy mode
- Check browser console for errors

---

## Project Structure

```
├── index.html              # Main HTML file
├── css/                    # Stylesheets
├── js/
│   ├── modules/           # Feature modules (scraper, sender, etc)
│   ├── components/        # UI components (ui, theme, etc)
│   ├── app.js            # App initialization
│   ├── router.js         # Tab routing
│   └── state.js          # State management
├── server/
│   └── index.js          # Express backend server
├── package.json          # Node.js dependencies
├── .env                  # Environment variables
└── README.md             # This file
```

---

## Features

✅ Domain email scraping  
✅ Bulk Gmail link generation  
✅ CSV import/export  
✅ Dark/Light theme  
✅ Fallback proxy support  
✅ Zero CORS issues with backend  
✅ Progressive enhancement  

---

## Support

For issues or questions:
- Check browser console (F12 → Console)
- Check server logs
- Verify environment variables
- Check API connectivity

Happy scraping! 🚀