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

## Environment Variables

| Key | Default | Description |
|-----|---------|-------------|
| MONGODB_URI | mongodb://localhost:27017/passport-ocr | Mongo connection string |
| PORT | 5000 | API port |
| JWT_SECRET | change-me | Secret for JWT signing |


## License
MIT
