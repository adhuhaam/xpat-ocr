# Passport OCR Application

A full-stack application for extracting passport information using OCR technology (Tesseract.js) with CRUD functionality.

## Features

- **OCR Processing**: Automatic extraction of passport information from images and PDFs
- **Drag & Drop Upload**: Easy file upload with drag-and-drop support
- **Data Verification**: Preview and edit extracted data before saving
- **CRUD Operations**: Create, Read, Update, and Delete passport records
- **Search Functionality**: Search passports by various fields
- **Expiry Tracking**: Visual indicators for expired and expiring passports
- **Responsive Design**: Modern UI with Material-UI components

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- Tesseract.js for OCR
- Multer for file uploads
- Sharp for image preprocessing
- pdf-parse for PDF text extraction

### Frontend
- React with TypeScript
- Material-UI for components
- Axios for API calls
- React Router for navigation
- React Dropzone for file uploads

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (running locally or MongoDB Atlas)
- npm or yarn

## Quick Start

For a quick start, use the provided script:
```bash
chmod +x start.sh
./start.sh
```

This will check MongoDB, install dependencies, and start both servers.

## Manual Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd passport-ocr-app
```

2. Install all dependencies:
```bash
npm run install-all
```

Or install separately:
```bash
cd backend
npm install
cd ../frontend
npm install
```

## Configuration

1. Backend configuration:
   - Copy `.env.example` to `.env` in the backend directory
   - Update the MongoDB URI and other settings:
   ```
   MONGODB_URI=mongodb://localhost:27017/passport-ocr
   PORT=5000
   JWT_SECRET=your-secret-key
   ```

2. Frontend configuration:
   - The frontend is configured to connect to `http://localhost:5000/api` by default
   - Update `src/services/api.ts` if your backend runs on a different port

## Running the Application

### Option 1: Run both servers together (Recommended)

1. Start MongoDB (if running locally):
```bash
mongod
```

2. From the root directory, run both servers:
```bash
npm run dev
```

This will start both backend (port 5000) and frontend (port 3000) servers concurrently.

### Option 2: Run servers separately

1. Start MongoDB (if running locally):
```bash
mongod
```

2. Start the backend server:
```bash
cd backend
npm run dev
```

3. In a new terminal, start the frontend development server:
```bash
cd frontend
npm start
```

4. Open your browser and navigate to `http://localhost:3000`

## Usage

1. **Upload Passport**:
   - Navigate to the Upload page
   - Drag and drop or click to select a passport image/PDF
   - Review the extracted information
   - Edit any fields if needed
   - Click "Confirm & Save" to store the data

2. **View Passports**:
   - Navigate to the Passports page
   - View all stored passport records
   - Use search to find specific passports
   - Click view icon to see details
   - Edit or delete records as needed

## API Endpoints

- `POST /api/passports/upload` - Upload and extract passport data
- `POST /api/passports/save` - Save verified passport data
- `GET /api/passports` - Get all passports (with pagination)
- `GET /api/passports/:id` - Get passport by ID
- `PUT /api/passports/:id` - Update passport
- `DELETE /api/passports/:id` - Delete passport
- `GET /api/passports/search` - Search passports
- `GET /api/passports/statistics` - Get statistics

## Supported File Formats

- Images: JPEG, JPG, PNG, GIF, BMP, TIFF
- Documents: PDF

## OCR Accuracy Tips

For best OCR results:
- Use high-resolution images (300 DPI or higher)
- Ensure passport is well-lit and clearly visible
- Avoid blurry or skewed images
- The MRZ (Machine Readable Zone) should be clearly visible

## Security Considerations

- Change the default JWT secret in production
- Use HTTPS in production
- Implement proper authentication and authorization
- Validate and sanitize all inputs
- Consider encrypting sensitive passport data

## Development

### Building for Production

Backend:
```bash
cd backend
npm run build
```

Frontend:
```bash
cd frontend
npm run build
```

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## Troubleshooting

1. **MongoDB Connection Issues**:
   - Ensure MongoDB is running
   - Check the connection URI in `.env`

2. **OCR Not Working**:
   - Check if the image quality is sufficient
   - Verify file format is supported
   - Check browser console for errors

3. **CORS Issues**:
   - Ensure backend CORS is configured correctly
   - Check if frontend API URL matches backend URL

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.