# Passport OCR Application

Extract vital information from passport images/PDFs using OCR (Tesseract.js) and store the verified data in MongoDB.  
Front-end: React + TypeScript  |  Back-end: Node + Express.

---

## Local Usage (Development)

Prerequisites: **Node v14+**, **npm**, **MongoDB** running on `mongodb://localhost:27017`.

```bash
# Clone
git clone <repository-url>
cd passport-ocr-app

# Backend
cd backend
cp .env.example .env      # adjust if needed
npm install
npm run dev               # starts API on :5000 with nodemon

# In another terminal – Frontend
cd ../frontend
npm install
npm start                 # serves React app on :3000
```
The React app proxies API requests to `http://localhost:5000`.

---

## Production Hosting on a Local Ubuntu Server

Tested on **Ubuntu 22.04 LTS** (works on similar releases).

### 1 · Install System Packages
```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y build-essential git curl nginx ufw

# Node LTS (NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm i -g pm2

# MongoDB Community 7.0
curl -fsSL https://pgp.mongodb.com/server-7.0.asc | sudo gpg --dearmor -o /usr/share/keyrings/mongodb-server-7.0.gpg
echo "deb [ arch=amd64 signed-by=/usr/share/keyrings/mongodb-server-7.0.gpg ] https://repo.mongodb.org/apt/ubuntu \$(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update && sudo apt install -y mongodb-org
sudo systemctl enable --now mongod
```

### 2 · Clone & Build the App
```bash
cd /var/www
sudo git clone <repository-url> passport-ocr-app
sudo chown -R $USER:$USER passport-ocr-app

# Backend
cd passport-ocr-app/backend
cp .env.example .env      # point MONGODB_URI at mongodb://localhost:27017/passport-ocr
npm ci --production

# Frontend
cd ../frontend
npm ci && npm run build  # outputs static files to build/
```

### 3 · Run the API with PM2
```bash
cd /var/www/passport-ocr-app/backend
pm2 start server.js --name passport-api
pm2 save                 # auto-restart on boot
```

### 4 · Configure Nginx
Create `/etc/nginx/sites-available/passport-ocr`:
```nginx
server {
    listen 80;
    server_name _;  # use your IP or domain

    # React build
    root /var/www/passport-ocr-app/frontend/build;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:5000/;
        proxy_set_header Host $host;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # React Router fallback
    location / {
        try_files $uri /index.html;
    }
}
```
Enable & reload:
```bash
sudo ln -s /etc/nginx/sites-available/passport-ocr /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 5 · Firewall & (optional) HTTPS
```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw enable

# HTTPS with Let's Encrypt (if you have a domain)
sudo snap install --classic certbot
sudo certbot --nginx -d example.com -d www.example.com
```

---
Your app is now available at `http://<server-ip>` (or `https://example.com`) and the API at `http://<server-ip>/api/*`.
