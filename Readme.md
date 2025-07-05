# Passport OCR Application

A full-stack application for extracting passport information from images and PDFs using OCR (Tesseract.js) and storing the verified data in MongoDB. It ships with a React TypeScript frontend and an Express/Mongo backend.

## Project Structure
```
.
├── server.js               # Stand-alone Express server (optional)
├── utils/                  # OCR helpers
├── controllers/ routes/…   # API logic
└── passport-ocr-app/
    ├── backend/           # Node / Express API service
    └── frontend/          # React + TS client
```

## Prerequisites
* Node.js v14+ and npm
* MongoDB running locally or an Atlas connection string
* (optional) Docker & Docker Compose for containerised deployment

## Getting Started (Local Development)

1. Clone the repo  
   ```bash
   git clone <repository-url>
   cd passport-ocr-app
   ```

2. Configure environment variables  
   ```bash
   cd backend
   cp .env.example .env
   # edit MONGODB_URI, PORT, JWT_SECRET as you wish
   ```

3. Install dependencies  
   ```bash
   npm install           # installs backend deps
   cd ../frontend
   npm install           # installs frontend deps
   ```

4. Start MongoDB (if running locally)  
   ```bash
   mongod
   ```

5. Run the app  
   ```bash
   # In one terminal (backend)
   cd passport-ocr-app/backend
   npm run dev           # nodemon server.js on :5000

   # In another terminal (frontend)
   cd passport-ocr-app/frontend
   npm start             # react-scripts start on :3000
   ```

   The UI will open at http://localhost:3000 and will proxy API requests to http://localhost:5000.

## One-Click Start Script
A convenience script is provided that installs everything, checks MongoDB and boots both services:

```bash
chmod +x passport-ocr-app/start.sh
./passport-ocr-app/start.sh
```

## Running Tests
```bash
# backend tests
cd passport-ocr-app/backend
npm test

# frontend tests
cd passport-ocr-app/frontend
npm test
```

## Deployment

### 1. Docker Compose (recommended)

**Why this is the easiest path:** Docker Compose spins up the whole stack (backend, database, and frontend) in isolated containers with a single command. That means:
- No need to install Node, MongoDB, or any build tools on the host
- The environment is identical in development, staging, and production ("works on my machine" problems disappear)
- All services share a private Docker network and sensible defaults (ports 5000/3000) but can be remapped easily
- Data is persisted in a named volume (`mongo-data`) and can be backed-up or removed without touching host files
- One-liner cleanup: `docker compose down -v` stops everything and erases volumes if desired

A sample `docker-compose.yml` is included below.  
Copy it to the project root and run `docker compose up -d`.

```yaml
version: "3.9"
services:
  api:
    build: ./passport-ocr-app/backend
    env_file: ./passport-ocr-app/backend/.env
    ports:
      - "5000:5000"
    depends_on:
      - mongo
  client:
    build: ./passport-ocr-app/frontend
    stdin_open: true
    ports:
      - "3000:80"
  mongo:
    image: mongo:7
    volumes:
      - mongo-data:/data/db
volumes:
  mongo-data:
```

### 2. Render / Heroku (Backend) & Netlify / Vercel (Frontend)

Backend:
1. Create a new Web Service (Node) pointing to `passport-ocr-app/backend`.
2. Set the environment variables `MONGODB_URI`, `PORT` (defaults to 5000) and `JWT_SECRET`.
3. Build & deploy – Render/Heroku will run `npm start`.

Frontend:
1. Create a new site from the `passport-ocr-app/frontend` directory.
2. Build command: `npm run build`
3. Publish directory: `build`
4. Set environment variable `REACT_APP_API_BASE` if your backend URL differs from the default.

### 3. Manual VPS

1. Build frontend  
   ```bash
   cd passport-ocr-app/frontend
   npm run build
   ```
2. Copy the `build/` folder to your web server (Nginx, Apache, S3).
3. SSH to your server, install Node & PM2, then:
   ```bash
   cd /var/www/passport-ocr-app/backend
   npm ci --production
   pm2 start server.js --name passport-api
   ```

### 4. Self-Hosted Ubuntu Server (bare-metal or VM)

The following steps were verified on **Ubuntu 22.04 LTS** but work on most modern releases.

1. **Update & install required packages**
   ```bash
   sudo apt update && sudo apt upgrade -y
   # build essentials & git
   sudo apt install -y build-essential git curl

   # Node (use NodeSource) – replace 18.x with latest LTS if needed
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt install -y nodejs

   # PM2 process manager (global)
   sudo npm i -g pm2

   # MongoDB Community Edition
   curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
   echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
   sudo apt update && sudo apt install -y mongodb-org
   sudo systemctl enable --now mongod
   ```

2. **Clone the repository**
   ```bash
   cd /var/www
   sudo git clone <repository-url> passport-ocr-app
   sudo chown -R $USER:$USER passport-ocr-app
   ```

3. **Configure backend environment**
   ```bash
   cd passport-ocr-app/passport-ocr-app/backend
   cp .env.example .env
   nano .env   # update MONGODB_URI if using Atlas / auth
   ```

4. **Install dependencies & build**
   ```bash
   npm ci --production     # backend deps only
   # (optional) build TypeScript / transpile if you added Babel etc.

   # build frontend on the server
   cd ../frontend
   npm ci && npm run build
   ```

   The production-ready static files will be located in `passport-ocr-app/passport-ocr-app/frontend/build`.

5. **Serve API with PM2**
   ```bash
   cd ../backend
   pm2 start server.js --name passport-api
   pm2 save               # auto-restart on reboot
   ```

6. **Configure Nginx as a reverse proxy**
   ```bash
   sudo apt install -y nginx
   sudo nano /etc/nginx/sites-available/passport-ocr
   ```
   Paste configuration:
   ```nginx
   server {
     listen 80;
     server_name _;  # or your.local.ip / domain

     # Frontend
     root /var/www/passport-ocr-app/passport-ocr-app/frontend/build;
     index index.html;

     location /api/ {
       proxy_pass http://127.0.0.1:5000/;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }

     # React Router – fallback to index.html
     location / {
       try_files $uri /index.html;
     }
   }
   ```
   Enable & reload:
   ```bash
   sudo ln -s /etc/nginx/sites-available/passport-ocr /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

7. **Firewall (optional but recommended)**
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   sudo ufw enable
   ```

8. **HTTPS (optional)** – If you own a domain pointed to the server, secure it with Let's Encrypt:
   ```bash
   sudo snap install core; sudo snap refresh core
   sudo snap install --classic certbot
   sudo ln -s /snap/bin/certbot /usr/bin/certbot
   sudo certbot --nginx -d example.com -d www.example.com
   ```

Your React app should now load from `http://<server-ip>` (or `https://example.com`) and the API will be accessible under `/api/*`.

> **Tip:** Monitor the Node service with `pm2 monit` and logs via `pm2 logs passport-api`.

## Environment Variables

| Key | Default | Description |
|-----|---------|-------------|
| MONGODB_URI | mongodb://localhost:27017/passport-ocr | Mongo connection string |
| PORT | 5000 | API port |
| JWT_SECRET | change-me | Secret for JWT signing |


## License
MIT
