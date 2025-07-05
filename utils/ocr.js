const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const fs = require('fs');
const pdfParse = require('pdf-parse');

// Preprocess image for better OCR results
async function preprocessImage(inputPath, outputPath) {
  try {
    await sharp(inputPath)
      .greyscale()
      .normalize()
      .sharpen()
      .resize(null, null, {
        width: 2000,
        withoutEnlargement: true
      })
      .toFile(outputPath);
    return outputPath;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    return inputPath;
  }
}

// Parse MRZ (Machine Readable Zone) data
function parseMRZ(mrzLines) {
  const passportData = {};
  
  if (mrzLines && mrzLines.length >= 2) {
    const line1 = mrzLines[0].replace(/\s/g, '');
    const line2 = mrzLines[1].replace(/\s/g, '');
    
    // Parse Line 1 (Type P for passport)
    if (line1.startsWith('P')) {
      passportData.documentType = 'Passport';
      passportData.countryCode = line1.substring(2, 5).replace(/</g, '');
      
      // Extract names from line 1
      const nameSection = line1.substring(5).split('<<');
      if (nameSection.length >= 2) {
        passportData.lastName = nameSection[0].replace(/</g, ' ').trim();
        passportData.firstName = nameSection[1].replace(/</g, ' ').trim();
      }
    }
    
    // Parse Line 2
    if (line2.length >= 44) {
      passportData.passportNumber = line2.substring(0, 9).replace(/</g, '');
      passportData.nationality = line2.substring(10, 13).replace(/</g, '');
      passportData.dateOfBirth = parseMRZDate(line2.substring(13, 19));
      passportData.gender = line2.substring(20, 21);
      passportData.dateOfExpiry = parseMRZDate(line2.substring(21, 27));
    }
  }
  
  return passportData;
}

// Parse MRZ date format (YYMMDD)
function parseMRZDate(dateStr) {
  if (!dateStr || dateStr.length !== 6) return null;
  
  const year = parseInt(dateStr.substring(0, 2));
  const month = parseInt(dateStr.substring(2, 4)) - 1;
  const day = parseInt(dateStr.substring(4, 6));
  
  // Determine century (00-30 = 2000-2030, 31-99 = 1931-1999)
  const fullYear = year <= 30 ? 2000 + year : 1900 + year;
  
  return new Date(fullYear, month, day);
}

// Extract passport data from text using patterns
function extractPassportData(text) {
  const data = {};
  
  // Clean the text
  const cleanText = text.replace(/\s+/g, ' ').trim();
  
  // Passport number patterns
  const passportNumberRegex = /(?:passport\s*(?:no|number|#)?[\s:]*)?([A-Z]{1,2}\d{6,9})/i;
  const passportMatch = cleanText.match(passportNumberRegex);
  if (passportMatch) {
    data.passportNumber = passportMatch[1];
  }
  
  // Name patterns
  const surnameRegex = /(?:surname|last\s*name|family\s*name)[\s:]*([A-Z][A-Z\s'-]+)/i;
  const givenNameRegex = /(?:given\s*name|first\s*name|forename)[\s:]*([A-Z][A-Z\s'-]+)/i;
  
  const surnameMatch = cleanText.match(surnameRegex);
  if (surnameMatch) {
    data.lastName = surnameMatch[1].trim();
  }
  
  const givenNameMatch = cleanText.match(givenNameRegex);
  if (givenNameMatch) {
    data.firstName = givenNameMatch[1].trim();
  }
  
  // Date patterns (various formats)
  const dateRegex = /(\d{1,2}[\s\-\/]\w{3,}[\s\-\/]\d{2,4})|(\d{1,2}[\s\-\/]\d{1,2}[\s\-\/]\d{2,4})/g;
  const dates = cleanText.match(dateRegex) || [];
  
  // Date of birth
  const dobRegex = /(?:date\s*of\s*birth|birth\s*date|born)[\s:]*(\d{1,2}[\s\-\/]\w{3,}[\s\-\/]\d{2,4})/i;
  const dobMatch = cleanText.match(dobRegex);
  if (dobMatch) {
    data.dateOfBirth = parseDate(dobMatch[1]);
  }
  
  // Date of issue
  const issueRegex = /(?:date\s*of\s*issue|issued)[\s:]*(\d{1,2}[\s\-\/]\w{3,}[\s\-\/]\d{2,4})/i;
  const issueMatch = cleanText.match(issueRegex);
  if (issueMatch) {
    data.dateOfIssue = parseDate(issueMatch[1]);
  }
  
  // Date of expiry
  const expiryRegex = /(?:date\s*of\s*expiry|expiry\s*date|expires|valid\s*until)[\s:]*(\d{1,2}[\s\-\/]\w{3,}[\s\-\/]\d{2,4})/i;
  const expiryMatch = cleanText.match(expiryRegex);
  if (expiryMatch) {
    data.dateOfExpiry = parseDate(expiryMatch[1]);
  }
  
  // Nationality
  const nationalityRegex = /(?:nationality|citizen)[\s:]*([A-Z][A-Z\s]+)/i;
  const nationalityMatch = cleanText.match(nationalityRegex);
  if (nationalityMatch) {
    data.nationality = nationalityMatch[1].trim();
  }
  
  // Gender
  const genderRegex = /(?:sex|gender)[\s:]*([MF]|Male|Female)/i;
  const genderMatch = cleanText.match(genderRegex);
  if (genderMatch) {
    data.gender = genderMatch[1].charAt(0).toUpperCase();
  }
  
  // Place of birth
  const pobRegex = /(?:place\s*of\s*birth|birthplace)[\s:]*([A-Z][A-Z\s,]+)/i;
  const pobMatch = cleanText.match(pobRegex);
  if (pobMatch) {
    data.placeOfBirth = pobMatch[1].trim();
  }
  
  // Extract MRZ if present
  const mrzRegex = /P<[A-Z]{3}[A-Z<]+<<[A-Z<]+/;
  const mrzMatch = cleanText.match(mrzRegex);
  if (mrzMatch) {
    // Find MRZ lines
    const lines = text.split('\n');
    const mrzLines = lines.filter(line => line.includes('P<') || /^[A-Z0-9<]{44}$/.test(line.trim()));
    if (mrzLines.length >= 2) {
      data.mrzLine1 = mrzLines[0].trim();
      data.mrzLine2 = mrzLines[1].trim();
      
      // Parse MRZ data
      const mrzData = parseMRZ(mrzLines);
      Object.assign(data, mrzData);
    }
  }
  
  return data;
}

// Parse various date formats
function parseDate(dateStr) {
  if (!dateStr) return null;
  
  try {
    // Try to parse the date
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return date;
    }
  } catch (error) {
    console.error('Error parsing date:', dateStr);
  }
  
  return null;
}

// Convert PDF to images
async function pdfToImage(pdfPath) {
  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);
  
  // For now, we'll extract text from PDF directly
  // In production, you might want to convert PDF pages to images
  return {
    text: data.text,
    numpages: data.numpages
  };
}

// Main OCR function
async function extractPassportInfo(filePath, fileType) {
  let ocrResult;
  let extractedData = {};
  
  try {
    if (fileType === 'application/pdf') {
      // Handle PDF files
      const pdfData = await pdfToImage(filePath);
      extractedData = extractPassportData(pdfData.text);
      extractedData.extractedText = pdfData.text;
      extractedData.confidence = 85; // Default confidence for PDF text extraction
    } else {
      // Handle image files
      const processedImagePath = filePath.replace(/\.[^/.]+$/, '_processed.jpg');
      await preprocessImage(filePath, processedImagePath);
      
      // Perform OCR with Tesseract
      ocrResult = await Tesseract.recognize(
        processedImagePath,
        'eng',
        {
          logger: m => console.log(m)
        }
      );
      
      const extractedText = ocrResult.data.text;
      extractedData = extractPassportData(extractedText);
      extractedData.extractedText = extractedText;
      extractedData.confidence = ocrResult.data.confidence;
      
      // Clean up processed image
      if (fs.existsSync(processedImagePath)) {
        fs.unlinkSync(processedImagePath);
      }
    }
    
    return extractedData;
  } catch (error) {
    console.error('OCR extraction error:', error);
    throw error;
  }
}

module.exports = {
  extractPassportInfo,
  preprocessImage,
  extractPassportData
};