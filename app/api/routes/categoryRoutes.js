const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middlewares/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/categories/' });
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');

const router = express.Router();

// CRUD
router.post('/', protect, upload.single('image'), [
  body('name').notEmpty().withMessage('Category name is required')
], createCategory);

router.get('/', getCategories);
router.get('/:id', getCategory);
router.put('/:id', protect, upload.single('image'), updateCategory);
router.delete('/:id', protect, deleteCategory);

module.exports = router;
