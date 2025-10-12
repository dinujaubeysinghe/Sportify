const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middlewares/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/brands/' });
const {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand,
  activeBrand
} = require('../controllers/brandController');

const router = express.Router();

// CRUD
router.post('/', protect, upload.single('logo'), [
  body('name').notEmpty().withMessage('Brand name is required')
], createBrand);

router.get('/', getBrands);
router.get('/:id', getBrand);
router.put('/:id', protect, upload.single('logo'), updateBrand);
router.put('/activate/:id', protect, activeBrand);
router.delete('/:id', protect, deleteBrand);


module.exports = router;
