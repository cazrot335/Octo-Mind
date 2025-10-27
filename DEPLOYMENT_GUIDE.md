# 🚀 OctoMind Deployment Guide

## Hosting Your OctoMind Application

This guide covers multiple deployment options for hosting both frontend and backend.

---

## 🎯 Recommended Stack

**Frontend**: Vercel or Netlify (Free)  
**Backend**: Render or Railway (Free tier available)  
**Database**: Firebase Firestore (Already configured)  
**AI**: Groq API (Already configured)

---

## 📦 Option 1: Vercel (Frontend) + Render (Backend)

### ✅ Best for: Production-ready, free tier, easy setup

### Frontend Deployment (Vercel)

#### Step 1: Prepare Frontend for Production

1. **Update API Base URL** in frontend components to use environment variable:

Create `.env.production` in `frontend/`:
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

2. **Update all components** to use environment variable:

In each component (TaskManager.js, EmotionTracker.js, etc.), change:
```javascript
// OLD
const API_BASE_URL = 'http://localhost:3001/api/tasks';

// NEW
const API_BASE_URL = `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/api/tasks`;
```

3. **Add build script** (already in package.json):
```json
"scripts": {
  "build": "react-scripts build"
}
```

#### Step 2: Deploy to Vercel

**Option A: Vercel CLI**
```bash
cd frontend

# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name: octomind-frontend
# - Directory: ./
# - Override settings? No

# Deploy to production
vercel --prod
```

**Option B: GitHub Integration** (Easier)
1. Push your code to GitHub (already done)
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your `Octo-Mind` repository
5. Configure:
   - Framework Preset: Create React App
   - Root Directory: `frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`
6. Add Environment Variable:
   - Key: `REACT_APP_API_URL`
   - Value: (will add after backend deployment)
7. Click "Deploy"

---

### Backend Deployment (Render)

#### Step 1: Prepare Backend for Production

1. **Create `render.yaml`** in project root:
```yaml
services:
  - type: web
    name: octomind-backend
    env: node
    region: oregon
    plan: free
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 3001
      - key: GROQ_API_KEY
        sync: false
      - key: FIREBASE_PROJECT_ID
        sync: false
      - key: FIREBASE_CLIENT_EMAIL
        sync: false
      - key: FIREBASE_PRIVATE_KEY
        sync: false
```

2. **Update backend CORS** in `backend/app.js`:
```javascript
const cors = require('cors');

// Update CORS to allow your Vercel domain
app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://octomind-frontend.vercel.app', // Add your Vercel URL
    'https://*.vercel.app' // Allow all Vercel preview deployments
  ],
  credentials: true
}));
```

3. **Environment Variables Setup**:
Create `.env` in `backend/` (for local only, don't commit):
```env
NODE_ENV=production
PORT=3001
GROQ_API_KEY=your_groq_api_key
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

4. **Update Firebase Config** to use environment variables:

Edit `backend/config/firebase.js`:
```javascript
const admin = require('firebase-admin');

// Use environment variables in production
const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID || "your-project-id",
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID || "key-id",
  private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n') || "-----BEGIN PRIVATE KEY-----\n...",
  client_email: process.env.FIREBASE_CLIENT_EMAIL || "your-email@project.iam.gserviceaccount.com",
  client_id: process.env.FIREBASE_CLIENT_ID || "client-id",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: process.env.FIREBASE_CERT_URL || "cert-url"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

module.exports = { getFirestore: () => admin.firestore() };
```

#### Step 2: Deploy to Render

**Option A: Render Dashboard**
1. Go to [render.com](https://render.com)
2. Sign up / Login
3. Click "New +" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - Name: `octomind-backend`
   - Region: Choose closest to you
   - Branch: `main`
   - Root Directory: `backend`
   - Runtime: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Plan: `Free`
6. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `PORT` = `3001`
   - `GROQ_API_KEY` = (your Groq API key)
   - `FIREBASE_PROJECT_ID` = (from Firebase)
   - `FIREBASE_CLIENT_EMAIL` = (from Firebase)
   - `FIREBASE_PRIVATE_KEY` = (from Firebase, paste entire key)
7. Click "Create Web Service"

**Option B: Render CLI**
```bash
# Install Render CLI
npm install -g render

# Login
render login

# Deploy
render deploy
```

#### Step 3: Connect Frontend to Backend

1. Copy your Render backend URL (e.g., `https://octomind-backend.onrender.com`)
2. Go back to Vercel project settings
3. Add/Update Environment Variable:
   - `REACT_APP_API_URL` = `https://octomind-backend.onrender.com`
4. Redeploy frontend

---

## 📦 Option 2: Netlify (Frontend) + Railway (Backend)

### Frontend on Netlify

```bash
cd frontend

# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize
netlify init

# Deploy
netlify deploy --prod
```

Or use Netlify's GitHub integration (similar to Vercel).

### Backend on Railway

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `Octo-Mind` repository
4. Configure:
   - Root Directory: `backend`
   - Start Command: `npm start`
5. Add environment variables (same as Render)
6. Deploy

---

## 📦 Option 3: Both on Heroku (All-in-One)

### Prerequisites
```bash
# Install Heroku CLI
# Download from: https://devcli.heroku.com/

# Login
heroku login
```

### Deploy Backend

```bash
cd backend

# Create Heroku app
heroku create octomind-backend

# Add Node.js buildpack
heroku buildpacks:set heroku/nodejs

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set GROQ_API_KEY=your_groq_key
heroku config:set FIREBASE_PROJECT_ID=your_project_id
heroku config:set FIREBASE_CLIENT_EMAIL=your_email
heroku config:set FIREBASE_PRIVATE_KEY="your_private_key"

# Create Procfile
echo "web: npm start" > Procfile

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main

# Open app
heroku open
```

### Deploy Frontend

```bash
cd frontend

# Create Heroku app
heroku create octomind-frontend

# Add buildpack
heroku buildpacks:set mars/create-react-app

# Set backend URL
heroku config:set REACT_APP_API_URL=https://octomind-backend.herokuapp.com

# Deploy
git add .
git commit -m "Deploy frontend"
git push heroku main
```

---

## 📦 Option 4: Docker + Any Cloud Provider

### Create Dockerfiles

**Backend Dockerfile** (`backend/Dockerfile`):
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["npm", "start"]
```

**Frontend Dockerfile** (`frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
ARG REACT_APP_API_URL
ENV REACT_APP_API_URL=$REACT_APP_API_URL

RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**Frontend nginx.conf**:
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

### Docker Compose (`docker-compose.yml` in root):
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - GROQ_API_KEY=${GROQ_API_KEY}
      - FIREBASE_PROJECT_ID=${FIREBASE_PROJECT_ID}
      - FIREBASE_CLIENT_EMAIL=${FIREBASE_CLIENT_EMAIL}
      - FIREBASE_PRIVATE_KEY=${FIREBASE_PRIVATE_KEY}
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      args:
        - REACT_APP_API_URL=http://localhost:3001
    ports:
      - "3000:80"
    depends_on:
      - backend
    restart: unless-stopped
```

Deploy to:
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **DigitalOcean App Platform**
- **Azure Container Instances**

---

## 🔧 Post-Deployment Checklist

### 1. Update CORS in Backend
```javascript
// backend/app.js
const allowedOrigins = [
  'http://localhost:3000',
  'https://your-frontend-domain.vercel.app',
  'https://your-custom-domain.com'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
```

### 2. Test All Endpoints
```bash
# Test backend health
curl https://your-backend-url.onrender.com/api/tasks

# Test frontend
open https://your-frontend-url.vercel.app
```

### 3. Set Up Custom Domain (Optional)

**Vercel Custom Domain**:
1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS (A/CNAME records)

**Render Custom Domain**:
1. Go to Service → Settings → Custom Domains
2. Add domain
3. Configure DNS

### 4. Enable HTTPS
- Vercel: Automatic
- Render: Automatic
- Heroku: Automatic
- Others: Configure SSL certificate

### 5. Set Up Monitoring

**Backend Monitoring**:
- Render: Built-in logs and metrics
- Add: Sentry for error tracking
- Add: LogRocket for session replay

**Frontend Monitoring**:
- Vercel Analytics (built-in)
- Google Analytics
- Sentry for React

---

## 💰 Cost Comparison

| Service | Frontend | Backend | Free Tier Limits |
|---------|----------|---------|------------------|
| **Vercel** | ✅ Free | - | 100GB bandwidth/month |
| **Netlify** | ✅ Free | - | 100GB bandwidth/month |
| **Render** | - | ✅ Free | 750 hours/month, sleeps after 15min inactive |
| **Railway** | - | ✅ Free | $5 credit/month |
| **Heroku** | Free dyno retired | Free dyno retired | - |
| **Firebase Hosting** | ✅ Free | - | 10GB storage, 360MB/day transfer |

**Recommended Free Combo**: Vercel (Frontend) + Render (Backend) + Firebase (Database - already using)

---

## 🚨 Important Notes

### Backend on Render Free Tier
- **Sleeps after 15 minutes of inactivity**
- First request after sleep takes ~30 seconds to wake up
- Solution: Upgrade to paid tier ($7/month) or use Railway

### Environment Variables Security
- **Never commit** `.env` files to Git
- Store secrets in platform's environment variable settings
- Use `.env.example` for documentation:

```env
# .env.example
NODE_ENV=production
PORT=3001
GROQ_API_KEY=your_groq_api_key_here
FIREBASE_PROJECT_ID=your_firebase_project_id
FIREBASE_CLIENT_EMAIL=your_firebase_client_email
FIREBASE_PRIVATE_KEY=your_firebase_private_key
```

### Firebase Firestore
- Already hosted by Google
- No additional deployment needed
- Ensure Firestore rules allow your backend IP

---

## 🔄 Continuous Deployment

### Auto-Deploy on Git Push

**Vercel + GitHub**:
- Automatically deploys on every push to `main`
- Preview deployments for pull requests

**Render + GitHub**:
- Enable "Auto-Deploy" in settings
- Deploys on every push to `main`

---

## 📊 Monitoring & Logs

### View Logs

**Vercel**:
```bash
vercel logs
```

**Render**:
- Dashboard → Logs tab
- Real-time streaming

**Railway**:
- Dashboard → Deployments → View Logs

---

## 🎯 Quick Start (Recommended Path)

```bash
# 1. Deploy Backend to Render
- Go to render.com
- New Web Service
- Connect GitHub
- Deploy backend/
- Copy backend URL

# 2. Update Frontend Environment
- Create .env.production in frontend/
- Add REACT_APP_API_URL=https://your-backend.onrender.com

# 3. Deploy Frontend to Vercel
- Go to vercel.com
- New Project
- Import from GitHub
- Deploy frontend/

# 4. Test
- Open Vercel URL
- Test all 5 modules
- Check browser console for errors

# 5. Done! 🎉
```

---

## 🆘 Troubleshooting

### Issue: CORS Error
**Solution**: Update backend CORS to include frontend URL

### Issue: 404 on Frontend Routes
**Solution**: Add `_redirects` file in `frontend/public/`:
```
/*    /index.html   200
```

For Vercel, create `vercel.json`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

### Issue: Environment Variables Not Working
**Solution**: 
- Restart deployment after adding variables
- Check variable names match exactly
- For Vercel, must start with `REACT_APP_`

### Issue: Backend Sleeping on Render
**Solutions**:
1. Upgrade to paid tier ($7/month - always on)
2. Use a cron job to ping every 14 minutes
3. Use Railway instead (better free tier)

---

## 📚 Additional Resources

- [Vercel Docs](https://vercel.com/docs)
- [Render Docs](https://render.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Docker Docs](https://docs.docker.com)

---

## ✅ Production Checklist

- [ ] Backend deployed and accessible
- [ ] Frontend deployed and accessible
- [ ] Environment variables set
- [ ] CORS configured correctly
- [ ] Firebase connection working
- [ ] Groq AI integration working
- [ ] All 5 modules tested in production
- [ ] Custom domain configured (optional)
- [ ] HTTPS enabled
- [ ] Error monitoring set up
- [ ] Logs accessible
- [ ] Performance optimized

---

**🎊 Your OctoMind app is now live and accessible worldwide! 🌍**
