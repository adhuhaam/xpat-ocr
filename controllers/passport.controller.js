const Passport = require('../models/Passport');
const { extractPassportInfo } = require('../utils/ocr');
const fs = require('fs');
const path = require('path');

// Upload and extract passport data
exports.uploadAndExtract = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const fileType = req.file.mimetype;

    // Extract passport information using OCR
    const extractedData = await extractPassportInfo(filePath, fileType);

    // Add file path to extracted data
    extractedData.imageUrl = `/uploads/${req.file.filename}`;

    res.json({
      success: true,
      data: extractedData,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload and extract error:', error);
    
    // Clean up uploaded file on error
    if (req.file && req.file.path) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      error: 'Failed to extract passport information',
      details: error.message
    });
  }
};

// Save verified passport data
exports.savePassport = async (req, res) => {
  try {
    const passportData = req.body;

    // Check if passport number already exists
    const existingPassport = await Passport.findOne({ 
      passportNumber: passportData.passportNumber 
    });

    if (existingPassport) {
      return res.status(400).json({ 
        error: 'Passport number already exists in the database' 
      });
    }

    // Set verification timestamp
    passportData.verifiedAt = new Date();

    // Create new passport document
    const passport = new Passport(passportData);
    await passport.save();

    res.status(201).json({
      success: true,
      message: 'Passport data saved successfully',
      data: passport
    });
  } catch (error) {
    console.error('Save passport error:', error);
    res.status(500).json({
      error: 'Failed to save passport data',
      details: error.message
    });
  }
};

// Get all passports with pagination
exports.getAllPassports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const total = await Passport.countDocuments();
    const passports = await Passport.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: passports,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Get all passports error:', error);
    res.status(500).json({
      error: 'Failed to fetch passports',
      details: error.message
    });
  }
};

// Get passport by ID
exports.getPassportById = async (req, res) => {
  try {
    const passport = await Passport.findById(req.params.id);

    if (!passport) {
      return res.status(404).json({ error: 'Passport not found' });
    }

    res.json({
      success: true,
      data: passport
    });
  } catch (error) {
    console.error('Get passport by ID error:', error);
    res.status(500).json({
      error: 'Failed to fetch passport',
      details: error.message
    });
  }
};

// Update passport
exports.updatePassport = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData._id;
    delete updateData.createdAt;

    // Check if passport number is being changed
    if (updateData.passportNumber) {
      const existingPassport = await Passport.findOne({
        passportNumber: updateData.passportNumber,
        _id: { $ne: id }
      });

      if (existingPassport) {
        return res.status(400).json({
          error: 'Passport number already exists'
        });
      }
    }

    const passport = await Passport.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!passport) {
      return res.status(404).json({ error: 'Passport not found' });
    }

    res.json({
      success: true,
      message: 'Passport updated successfully',
      data: passport
    });
  } catch (error) {
    console.error('Update passport error:', error);
    res.status(500).json({
      error: 'Failed to update passport',
      details: error.message
    });
  }
};

// Delete passport
exports.deletePassport = async (req, res) => {
  try {
    const passport = await Passport.findByIdAndDelete(req.params.id);

    if (!passport) {
      return res.status(404).json({ error: 'Passport not found' });
    }

    // Delete associated image file if exists
    if (passport.imageUrl) {
      const filename = passport.imageUrl.split('/').pop();
      const filePath = path.join(__dirname, '..', 'uploads', filename);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.json({
      success: true,
      message: 'Passport deleted successfully'
    });
  } catch (error) {
    console.error('Delete passport error:', error);
    res.status(500).json({
      error: 'Failed to delete passport',
      details: error.message
    });
  }
};

// Search passports
exports.searchPassports = async (req, res) => {
  try {
    const { query, field } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let searchQuery = {};

    if (query) {
      if (field && field !== 'all') {
        // Search in specific field
        searchQuery[field] = new RegExp(query, 'i');
      } else {
        // Search in multiple fields
        searchQuery = {
          $or: [
            { passportNumber: new RegExp(query, 'i') },
            { firstName: new RegExp(query, 'i') },
            { lastName: new RegExp(query, 'i') },
            { nationality: new RegExp(query, 'i') }
          ]
        };
      }
    }

    const total = await Passport.countDocuments(searchQuery);
    const passports = await Passport.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      data: passports,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Search passports error:', error);
    res.status(500).json({
      error: 'Failed to search passports',
      details: error.message
    });
  }
};

// Get passport statistics
exports.getStatistics = async (req, res) => {
  try {
    const totalPassports = await Passport.countDocuments();
    const nationalities = await Passport.distinct('nationality');
    
    const expiringThisMonth = await Passport.countDocuments({
      dateOfExpiry: {
        $gte: new Date(),
        $lte: new Date(new Date().setMonth(new Date().getMonth() + 1))
      }
    });

    const expiredPassports = await Passport.countDocuments({
      dateOfExpiry: { $lt: new Date() }
    });

    res.json({
      success: true,
      data: {
        totalPassports,
        totalNationalities: nationalities.length,
        expiringThisMonth,
        expiredPassports,
        nationalities
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      error: 'Failed to fetch statistics',
      details: error.message
    });
  }
};