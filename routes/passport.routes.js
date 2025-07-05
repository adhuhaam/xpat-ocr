const express = require('express');
const router = express.Router();
const passportController = require('../controllers/passport.controller');
const upload = require('../middleware/upload');

// Upload and extract passport data
router.post('/upload', upload.single('passport'), passportController.uploadAndExtract);

// Save verified passport data
router.post('/save', passportController.savePassport);

// Get all passports with pagination
router.get('/', passportController.getAllPassports);

// Get passport statistics
router.get('/statistics', passportController.getStatistics);

// Search passports
router.get('/search', passportController.searchPassports);

// Get passport by ID
router.get('/:id', passportController.getPassportById);

// Update passport
router.put('/:id', passportController.updatePassport);

// Delete passport
router.delete('/:id', passportController.deletePassport);

module.exports = router;