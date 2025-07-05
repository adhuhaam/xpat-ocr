const mongoose = require('mongoose');

const passportSchema = new mongoose.Schema({
  passportNumber: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  placeOfBirth: {
    type: String,
    trim: true
  },
  nationality: {
    type: String,
    required: true,
    trim: true
  },
  gender: {
    type: String,
    enum: ['M', 'F', 'Male', 'Female', 'Other'],
    required: true
  },
  dateOfIssue: {
    type: Date,
    required: true
  },
  dateOfExpiry: {
    type: Date,
    required: true
  },
  placeOfIssue: {
    type: String,
    trim: true
  },
  mrzLine1: {
    type: String,
    trim: true
  },
  mrzLine2: {
    type: String,
    trim: true
  },
  extractedText: {
    type: String
  },
  imageUrl: {
    type: String
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100
  },
  verifiedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt timestamp before saving
passportSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create text index for search functionality
passportSchema.index({
  passportNumber: 'text',
  firstName: 'text',
  lastName: 'text',
  nationality: 'text'
});

module.exports = mongoose.model('Passport', passportSchema);